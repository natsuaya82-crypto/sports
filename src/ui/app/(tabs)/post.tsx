import { getManagedTeams } from '@/domain/user';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ScreenTitle } from '@/ui/components/list/ScreenTitle';
import { Screen } from '@/ui/components/Screen';
import { PostConditionCard } from '@/ui/components/opportunity/PostConditionCard';
import { PostContentCard } from '@/ui/components/opportunity/PostContentCard';
import { DAYS_TO_SHOW, dateChipLabel, type PostSheetKey } from '@/ui/components/opportunity/PostFormOptions';
import { PostHostCard } from '@/ui/components/opportunity/PostHostCard';
import { PostMemberRecruitCard } from '@/ui/components/opportunity/PostMemberRecruitCard';
import { PostScheduleCard } from '@/ui/components/opportunity/PostScheduleCard';
import { PostSheets } from '@/ui/components/opportunity/PostSheets';
import { PostSubmitFooter } from '@/ui/components/opportunity/PostSubmitFooter';
import { PostVenueCard } from '@/ui/components/opportunity/PostVenueCard';
import { Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useTeams } from '@/ui/hooks/use-teams';
import { createOpportunity } from '@/data/opportunity-store';
import { updateTeam } from '@/data/team-store';
import type { Location } from '@/domain/location';
import type { Level } from '@/domain/level';
import type { OpportunityKind } from '@/domain/opportunity';
import type { Sport } from '@/domain/sport';
import { addHoursToTime, getDateFromToday } from '@/lib/local-date';

export default function PostScreen() {
  const router = useRouter();

  const dates = useMemo(
    () => Array.from({ length: DAYS_TO_SHOW }, (_, i) => getDateFromToday(i)),
    [],
  );
  const user = useCurrentUser();
  const teams = useTeams();
  const myTeams = useMemo(
    () => getManagedTeams(teams, user),
    [teams, user],
  );

  const [sport, setSport] = useState<Sport | null>(null);
  const [kind, setKind] = useState<OpportunityKind | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dates[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState(2);
  const [venue, setVenue] = useState<Location | null>(null);
  const [venueOpen, setVenueOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState<PostSheetKey | null>(null);
  const [fee, setFee] = useState(0);
  const [level, setLevel] = useState<Level>('middle');
  const [capacity, setCapacity] = useState(4);
  const [hostName, setHostName] = useState(myTeams[0]?.name ?? user.displayName);
  // 常設メンバー募集(kind === 'team_member')用
  const hostTeam = myTeams.find((t) => t.name === hostName);
  const [memberNote, setMemberNote] = useState('');
  const isMemberRecruit = kind === 'team_member';

  const canSubmit = sport !== null && kind !== null && title.trim() !== '' && venue !== null;
  const canSubmitMemberRecruit = hostTeam !== undefined && memberNote.trim() !== '';

  const submitMemberRecruit = () => {
    if (hostTeam === undefined || memberNote.trim() === '') return;
    updateTeam(hostTeam.id, {
      memberRecruitNote: memberNote.trim(),
      recruitingKinds: hostTeam.recruitingKinds.includes('team_member')
        ? hostTeam.recruitingKinds
        : [...hostTeam.recruitingKinds, 'team_member'],
    });
    setMemberNote('');
    router.push({ pathname: '/team/[id]', params: { id: hostTeam.id } });
  };

  const submit = () => {
    if (sport === null || kind === null || venue === null || title.trim() === '') return;
    createOpportunity({
      kind,
      sport,
      title: title.trim(),
      date,
      startTime,
      endTime: addHoursToTime(startTime, duration),
      location: venue,
      fee,
      level,
      capacity,
      hostUserId: user.id,
      hostTeamId: hostTeam?.id ?? null,
      hostTeamName: hostName,
    });
    // 次の入力に備えて内容ものはリセットし、作成した日の一覧へ
    setTitle('');
    setVenue(null);
    router.push('/');
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <ScreenTitle title="募集をつくる" />

        <PostContentCard
          sport={sport}
          onSelectSport={setSport}
          kind={kind}
          onSelectKind={setKind}
          title={title}
          onChangeTitle={setTitle}
          isMemberRecruit={isMemberRecruit}
        />

        {!isMemberRecruit && (
          <>
            <PostScheduleCard
              dateLabel={dateChipLabel(date, dates.indexOf(date))}
              startTime={startTime}
              duration={duration}
              onOpenSheet={setOpenSheet}
            />
            <PostVenueCard venue={venue} onPress={() => setVenueOpen(true)} />
            <PostConditionCard
              fee={fee}
              onOpenSheet={setOpenSheet}
              level={level}
              onSelectLevel={setLevel}
              capacity={capacity}
              onChangeCapacity={setCapacity}
            />
          </>
        )}

        <PostHostCard
          myTeams={myTeams}
          personalName={user.displayName}
          selectedName={hostName}
          onSelect={setHostName}
        />

        {isMemberRecruit && (
          <PostMemberRecruitCard
            hostTeam={hostTeam}
            note={memberNote}
            onChangeNote={setMemberNote}
          />
        )}
        <PostSubmitFooter
          isMemberRecruit={isMemberRecruit}
          canSubmit={canSubmit}
          canSubmitMemberRecruit={canSubmitMemberRecruit}
          onSubmit={submit}
          onSubmitMemberRecruit={submitMemberRecruit}
        />
      </ScrollView>

      <PostSheets
        openSheet={openSheet}
        onCloseSheet={() => setOpenSheet(null)}
        venueOpen={venueOpen}
        onCloseVenue={() => setVenueOpen(false)}
        onSelectVenue={setVenue}
        dates={dates}
        date={date}
        onSelectDate={setDate}
        startTime={startTime}
        onSelectStartTime={setStartTime}
        duration={duration}
        onSelectDuration={setDuration}
        fee={fee}
        onSelectFee={setFee}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 96,
    gap: Spacing.three,
  },
});
