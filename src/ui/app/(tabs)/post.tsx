import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';

import { OptionSheet, SheetOption } from '@/ui/components/post/OptionSheet';
import { VenueSheet } from '@/ui/components/post/VenueSheet';
// TODO-PORT unresolved: Venue from @/data/mock-venues
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Brand,
  LevelColors,
  Palette,
  OpportunityKindColors,
  Spacing,
} from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useCurrentUser } from '@/ui/contexts/auth-context';
// TODO-PORT unresolved: dateFromToday from @/data/mock-opportunities
import { createOpportunity } from '@/data/opportunity-store';
import { updateTeam, useTeams } from '@/data/team-store';
import { Level, getLevelLabel } from '@/domain/level';
import { OpportunityKind, getOpportunityKindLabel } from '@/domain/opportunity';
import { Sport, getSportLabel } from '@/domain/sport';

const DAYS_TO_SHOW = 14;
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

/** 開始時間の選択肢(6:00〜22:00) */
const START_TIMES = Array.from({ length: 17 }, (_, i) => `${String(i + 6).padStart(2, '0')}:00`);

/** 何時間やるか */
const DURATIONS = [
  { label: '1時間', hours: 1 },
  { label: '1.5時間', hours: 1.5 },
  { label: '2時間', hours: 2 },
  { label: '2.5時間', hours: 2.5 },
  { label: '3時間', hours: 3 },
] as const;

const FEES = [0, 500, 1000, 1500, 2000, 3000] as const;

/** 開始時刻 + 時間数 → 終了時刻(HH:mm) */
function endTimeOf(startTime: string, hours: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = Math.min(h * 60 + m + hours * 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function dateChipLabel(date: string, index: number): string {
  if (index === 0) return '今日';
  if (index === 1) return '明日';
  const [, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(date).getDay()];
  return `${m}/${d}(${weekday})`;
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}

function Chip({ label, selected, onPress, color }: ChipProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? Brand.primary }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** カード型のセクション(アイコン+見出し) */
function Card({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={15} color={colors.text} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** カード内の小見出し */
function FieldLabel({ text }: { text: string }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

/** 「ラベル ・・・ 現在値 >」の選択行(タップでシートが開く) */
function SelectorRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.selectorRow, pressed && styles.selectorPressed]}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text style={styles.selectorValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function PostScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  const dates = useMemo(
    () => Array.from({ length: DAYS_TO_SHOW }, (_, i) => dateFromToday(i)),
    [],
  );
  const mockUser = useCurrentUser();
  const teams = useTeams();
  const myTeams = useMemo(
    () => teams.filter((t) => mockUser.managedTeamIds.includes(t.id)),
    [teams, mockUser],
  );

  const [sport, setSport] = useState<Sport | null>(null);
  const [type, setType] = useState<OpportunityKind | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(dates[0]);
  const [startTime, setStartTime] = useState('19:00');
  const [duration, setDuration] = useState(2);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueOpen, setVenueOpen] = useState(false);
  const [openSheet, setOpenSheet] = useState<'date' | 'time' | 'duration' | 'fee' | null>(
    null,
  );
  const [fee, setFee] = useState<number>(0);
  const [level, setLevel] = useState<Level>('middle');
  const [capacity, setCapacity] = useState(4);
  const [teamName, setTeamName] = useState(myTeams[0]?.name ?? mockUser.displayName);
  // 常設メンバー募集(type === 'member')用
  const hostTeam = myTeams.find((t) => t.name === teamName);
  const [memberNote, setMemberNote] = useState('');
  const isMemberRecruit = type === 'member';

  const canSubmit = sport !== null && type !== null && title.trim() !== '' && venue !== null;

  const submitMemberRecruit = () => {
    if (!hostTeam || !memberNote.trim()) return;
    updateTeam(hostTeam.id, {
      memberRecruitNote: memberNote.trim(),
      recruiting: hostTeam.recruiting.includes('member')
        ? hostTeam.recruiting
        : [...hostTeam.recruiting, 'member'],
    });
    setMemberNote('');
    router.push({ pathname: '/team/[id]', params: { id: hostTeam.id } });
  };

  const submit = () => {
    if (!canSubmit) return;
    createOpportunity({
      sport: sport!,
      type: type!,
      title: title.trim(),
      date,
      startTime,
      endTime: endTimeOf(startTime, duration),
      venueName: venue!.name,
      prefecture: venue!.prefecture,
      ward: venue!.ward,
      fee,
      level,
      capacity,
      teamName,
    });
    // 次の入力に備えて内容ものはリセットし、作成した日の一覧へ
    setTitle('');
    setVenue(null);
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>募集をつくる</Text>

        <Card icon="megaphone-outline" title="募集の内容">
          <FieldLabel text="競技" />
          <View style={styles.chipRow}>
            {(Object.keys(getSportLabel) as Sport[]).map((s) => (
              <Chip
                key={s}
                label={getSportLabel(s)}
                selected={sport === s}
                onPress={() => setSport(s)}
              />
            ))}
          </View>

          <FieldLabel text="募集タイプ" />
          <View style={styles.chipRow}>
            {(Object.keys(getOpportunityKindLabel) as OpportunityKind[]).map((t) => (
              <Chip
                key={t}
                label={getOpportunityKindLabel(t)}
                color={getOpportunityKindColor(t, Palette.tagText)}
                selected={type === t}
                onPress={() => setType(t)}
              />
            ))}
          </View>

          {!isMemberRecruit && (
            <>
              <FieldLabel text="タイトル" />
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="例: 日曜午前のエンジョイサッカー、助っ人2名!"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
              />
            </>
          )}
          {isMemberRecruit && (
            <Text style={styles.hint}>
              メンバー募集は日付のない常設の募集です。チームの公式サイトに掲載されます
            </Text>
          )}
        </Card>

        {!isMemberRecruit && (
        <>
        <Card icon="calendar-outline" title="日時">
          <SelectorRow
            label="日付"
            value={dateChipLabel(date, dates.indexOf(date))}
            onPress={() => setOpenSheet('date')}
          />
          <SelectorRow
            label="開始時間"
            value={startTime}
            onPress={() => setOpenSheet('time')}
          />
          <SelectorRow
            label="どれくらい"
            value={`${DURATIONS.find((d) => d.hours === duration)?.label}(〜${endTimeOf(startTime, duration)})`}
            onPress={() => setOpenSheet('duration')}
          />
        </Card>

        <Card icon="location-outline" title="場所">
          <Pressable
            onPress={() => setVenueOpen(true)}
            style={({ pressed }) => [styles.venueField, pressed && styles.venuePressed]}>
            {venue ? (
              <View style={styles.venueBody}>
                <Text style={styles.venueName} numberOfLines={1}>
                  {venue.name}
                </Text>
                <Text style={styles.venueWard}>{venue.ward}</Text>
              </View>
            ) : (
              <Text style={styles.venuePlaceholder}>会場をえらぶ</Text>
            )}
            <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
          </Pressable>
          <Text style={styles.hint}>
            指定した場所をもとに、見る人には現在地からの距離が表示されます
          </Text>
        </Card>

        <Card icon="options-outline" title="条件">
          <SelectorRow
            label="参加費"
            value={fee === 0 ? '無料' : `¥${fee.toLocaleString()}`}
            onPress={() => setOpenSheet('fee')}
          />

          <FieldLabel text="レベル" />
          <View style={styles.chipRow}>
            {(Object.keys(getLevelLabel) as Level[]).map((l) => (
              <Chip
                key={l}
                label={getLevelLabel(l)}
                color={LevelColors[l]}
                selected={level === l}
                onPress={() => setLevel(l)}
              />
            ))}
          </View>

          <FieldLabel text="募集人数" />
          <View style={styles.stepperRow}>
            <Pressable
              onPress={() => setCapacity((n) => Math.max(1, n - 1))}
              style={styles.stepperButton}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.stepperValue}>{capacity}人</Text>
            <Pressable
              onPress={() => setCapacity((n) => Math.min(30, n + 1))}
              style={styles.stepperButton}>
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
        </Card>
        </>
        )}

        <Card icon="person-outline" title="募集主体">
          <View style={styles.chipRow}>
            {myTeams.map((t) => (
              <Chip
                key={t.id}
                label={t.name}
                selected={teamName === t.name}
                onPress={() => setTeamName(t.name)}
              />
            ))}
            <Chip
              label={`${mockUser.displayName}(個人)`}
              selected={teamName === mockUser.displayName}
              onPress={() => setTeamName(mockUser.displayName)}
            />
          </View>
        </Card>

        {isMemberRecruit ? (
          <>
            <Card icon="megaphone-outline" title="募集内容(常設)">
              {hostTeam ? (
                <>
                  <Text style={styles.hint}>
                    「{hostTeam.name}」の公式サイトに掲載され、チーム検索に「メンバー募集」バッジが付きます
                  </Text>
                  <TextInput
                    value={memberNote}
                    onChangeText={setMemberNote}
                    multiline
                    placeholder={'例: DF・GK急募!経験者歓迎。\n毎週水曜19時〜、まずは体験からどうぞ。'}
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, styles.inputMultiline]}
                  />
                </>
              ) : (
                <Text style={styles.hint}>
                  メンバー募集はチームとして行います。「募集主体」でチームを選んでください
                </Text>
              )}
            </Card>
            <Pressable
              onPress={submitMemberRecruit}
              disabled={!hostTeam || !memberNote.trim()}
              style={({ pressed }) => [
                styles.submitButton,
                (!hostTeam || !memberNote.trim()) && styles.submitDisabled,
                pressed && styles.submitPressed,
              ]}>
              <Text style={styles.submitText}>公式サイトに掲載する</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={submit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                !canSubmit && styles.submitDisabled,
                pressed && canSubmit && styles.submitPressed,
              ]}>
              <Text style={styles.submitText}>この内容で募集する</Text>
            </Pressable>
            {!canSubmit && (
              <Text style={styles.submitHint}>
                競技・募集タイプ・タイトル・会場を入れると募集できます
              </Text>
            )}
          </>
        )}
      </ScrollView>

      <VenueSheet
        visible={venueOpen}
        onClose={() => setVenueOpen(false)}
        onSelect={setVenue}
      />
      <OptionSheet
        visible={openSheet === 'date'}
        title="日付"
        options={dates.map((d, i): SheetOption<string> => ({ label: dateChipLabel(d, i), value: d }))}
        selected={date}
        onSelect={setDate}
        onClose={() => setOpenSheet(null)}
      />
      <OptionSheet
        visible={openSheet === 'time'}
        title="開始時間"
        options={START_TIMES.map((t): SheetOption<string> => ({ label: t, value: t }))}
        selected={startTime}
        onSelect={setStartTime}
        onClose={() => setOpenSheet(null)}
      />
      <OptionSheet
        visible={openSheet === 'duration'}
        title="どれくらい"
        options={DURATIONS.map((d): SheetOption<number> => ({ label: d.label, value: d.hours }))}
        selected={duration}
        onSelect={setDuration}
        onClose={() => setOpenSheet(null)}
      />
      <OptionSheet
        visible={openSheet === 'fee'}
        title="参加費"
        options={FEES.map((f): SheetOption<number> => ({
          label: f === 0 ? '無料' : `¥${f.toLocaleString()}`,
          value: f,
        }))}
        selected={fee}
        onSelect={setFee}
        onClose={() => setOpenSheet(null)}
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: 96,
      gap: Spacing.three,
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.three,
      gap: Spacing.two,
      backgroundColor: c.background,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.half,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      marginTop: Spacing.one,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
    },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
      fontSize: 13,
      color: c.text,
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    hint: {
      fontSize: 11,
      color: c.textSecondary,
    },
    venueField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
    },
    venuePressed: {
      opacity: 0.7,
    },
    venueBody: {
      flex: 1,
      gap: 1,
    },
    venueName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
    venueWard: {
      fontSize: 11,
      color: c.textSecondary,
    },
    venuePlaceholder: {
      flex: 1,
      fontSize: 13,
      color: c.textSecondary,
    },
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 11,
    },
    selectorPressed: {
      opacity: 0.7,
    },
    selectorLabel: {
      flex: 1,
      fontSize: 12,
      color: c.textSecondary,
    },
    selectorValue: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    stepperButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    stepperValue: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      minWidth: 44,
      textAlign: 'center',
    },
    submitButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 999,
      backgroundColor: Brand.primary,
    },
    submitPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    submitDisabled: {
      opacity: 0.4,
    },
    submitText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
    submitHint: {
      fontSize: 11,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
