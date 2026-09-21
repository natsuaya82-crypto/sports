import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { findUser } from '@/data/user-store';
import type { Application, ApplicationStatus } from '@/domain/application';
import { getApplicationsForOpportunity } from '@/domain/application';
import type { Opportunity } from '@/domain/opportunity';
import { ListRow, ListRowBody } from '@/ui/components/list/ListRow';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import { useTeam } from '@/ui/hooks/use-teams';
import { Brand, Palette, Spacing } from '@/ui/theme';

/**
 * prototypeは 新着 / 返信済み / 参加確定 の3状態だったが、
 * 応募の状態は Application へ統合され、'new' と 'replied' は 'pending' に
 * まとまっている（docs/DOMAIN.md 第3章）。状態を画面側で増やさず、
 * pending は prototypeの「新着」の見た目をそのまま使う。
 */
const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: '新着',
  accepted: '参加確定',
  rejected: '見送り',
  withdrawn: '取り下げ',
};

/** 応募と、その応募先の募集 */
interface TeamApplication {
  application: Application;
  opportunity: Opportunity;
}

/** 応募者の確認(チームが受け取った応募) */
export default function ApplicantsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const applications = useApplications();
  const opportunities = useOpportunities();

  // このチームが主催する募集に届いた応募を、prototypeと同じく新しい順で並べる
  const applicants = useMemo<TeamApplication[]>(() => {
    if (!id) return [];
    return opportunities
      .filter((o) => o.hostTeamId === id)
      .flatMap((opportunity) =>
        getApplicationsForOpportunity(applications, opportunity.id).map(
          (application) => ({ application, opportunity }),
        ),
      )
      .sort((a, b) =>
        b.application.createdAt.localeCompare(a.application.createdAt),
      );
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
                {STATUS_LABEL[application.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.recruit} numberOfLines={1}>
            {opportunity.title}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {application.message}
          </Text>
        </ListRowBody>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </ListRow>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだ応募がありません</Text>
            <Text style={styles.emptyHint}>募集を出すと、応募がここに届きます</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
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
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.two },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    emptyHint: { fontSize: 12, color: c.textSecondary },
  });
