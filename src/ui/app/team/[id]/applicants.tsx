import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { findUser } from '@/data/user-store';
import type { Application } from '@/domain/application';
import { getApplicationsForTeam, isActive } from '@/domain/application';
import type { Opportunity } from '@/domain/opportunity';
import { getAttendanceOf } from '@/domain/participation';
import { getDateFromToday } from '@/lib/local-date';
import { Screen } from '@/ui/components/Screen';
import { ListEmptyState } from '@/ui/components/ListEmptyState';
import { ListRow, ListRowBody, ListRowChevron } from '@/ui/components/list/ListRow';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { ApplicationReviewActions } from '@/ui/components/review/ApplicationReviewActions';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import { useParticipations } from '@/ui/hooks/use-participations';
import { useTeam } from '@/ui/hooks/use-teams';
import { Brand, Palette, Spacing } from '@/ui/theme';

/**
 * prototypeは 新着 / 返信済み / 参加確定 の3状態だったが、
 * 応募の状態は Application へ統合され、'new' と 'replied' は 'pending' に
 * まとまっている（docs/DOMAIN.md 第3章）。
 *
 * 不成立（rejected）と取り下げ（withdrawn）は一覧に出さない。
 * 生きている応募だけを並べる（isActive）。
 */
const STATUS_LABEL: Record<'pending' | 'accepted', string> = {
  pending: '新着',
  accepted: '参加確定',
};

/** 応募と、その応募先の募集 */
interface TeamApplication {
  application: Application;
  opportunity: Opportunity;
}

/** 応募者の確認(チームが受け取った応募) */
export default function ApplicantsScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const applications = useApplications();
  const opportunities = useOpportunities();
  const participations = useParticipations();
  const today = getDateFromToday(0);

  // このチームが主催する募集に届いた応募を、prototypeと同じく新しい順で並べる
  const applicants = useMemo<TeamApplication[]>(() => {
    if (!id) return [];
    return getApplicationsForTeam(applications, opportunities, id)
      .filter(isActive)
      .flatMap((application) => {
        const opportunity = opportunities.find((o) => o.id === application.opportunityId);
        return opportunity === undefined ? [] : [{ application, opportunity }];
      });
  }, [id, opportunities, applications]);

  const renderItem = ({ item }: { item: TeamApplication }) => {
    const { application, opportunity } = item;
    const applicant = findUser(application.applicantUserId);
    const isPending = application.status === 'pending';
    return (
      <ListRow
        onPress={() =>
          applicant &&
          router.push({ pathname: '/user/[id]', params: { id: applicant.id } })
        }>
        <Image
          source={{ uri: applicant?.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <ListRowBody gap={3}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {applicant?.displayName ?? '応募者'}
            </Text>
            <View style={[styles.statusBadge, isPending && styles.statusNew]}>
              <Text style={[styles.statusText, isPending && styles.statusTextNew]}>
                {isPending ? STATUS_LABEL.pending : STATUS_LABEL.accepted}
              </Text>
            </View>
          </View>
          <Text style={styles.recruit} numberOfLines={1}>
            {opportunity.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {application.message}
          </Text>
          <ApplicationReviewActions
            application={application}
            opportunity={opportunity}
            attendance={getAttendanceOf(participations, application.id)}
            today={today}
          />
        </ListRowBody>
        <ListRowChevron />
      </ListRow>
    );
  };

  return (
    <Screen>
      <ScreenHeader title="応募者の確認" />

      {team && (
        <Text style={styles.subheader}>
          {team.name} への応募 {applicants.length}件
        </Text>
      )}

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.application.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ListEmptyState
            title="まだ応募がありません"
            hint="募集を出すと、応募がここに届きます"
          />
        }
      />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    subheader: {
      fontSize: 12,
      color: c.textSecondary,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    listContent: { padding: Spacing.three, gap: Spacing.two },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.backgroundElement,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text },
    statusBadge: {
      backgroundColor: c.backgroundElement,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    statusNew: { backgroundColor: Brand.danger },
    statusText: { fontSize: 10, fontWeight: '700', color: c.textSecondary },
    statusTextNew: { color: '#ffffff' },
    recruit: { fontSize: 11, fontWeight: '600', color: Brand.primary },
    message: { fontSize: 11, lineHeight: 16, color: c.textSecondary },
  });
