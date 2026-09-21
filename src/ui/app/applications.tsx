import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListEmptyState } from '@/ui/components/ListEmptyState';
import { ListRow, ListRowBody, ListRowChevron } from '@/ui/components/list/ListRow';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useOpportunity } from '@/ui/hooks/use-opportunities';
import { getApplicationsByApplicant, type Application } from '@/domain/application';

/** 応募履歴(マイページから) */
export default function ApplicationsScreen() {
  const styles = useThemedStyles(makeStyles);
  const currentUser = useCurrentUser();
  const applications = useApplications();

  const myApplications = useMemo(
    () => getApplicationsByApplicant(applications, currentUser.id),
    [applications, currentUser.id],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="応募履歴" />
      <FlatList
        data={myApplications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicationRow application={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ListEmptyState
            title="まだ応募がありません"
            hint="気になる募集に応募すると、ここに並びます"
          />
        }
      />
    </SafeAreaView>
  );
}

/**
 * 応募1件の行。
 * 募集のタイトル・主催チーム名は応募先のOpportunityから引く
 * (応募側で控えを持たない = Single Source of Truth)。
 */
function ApplicationRow({ application }: { application: Application }) {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const opportunity = useOpportunity(application.opportunityId);
  if (opportunity === undefined) return null;

  return (
    <ListRow
      onPress={() =>
        router.push({
          pathname: '/opportunity/[id]',
          params: { id: application.opportunityId },
        })
      }>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>応募済み</Text>
      </View>
      <ListRowBody gap={2}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {opportunity.title}
        </Text>
        <Text style={styles.rowTeam}>{opportunity.hostTeamName}</Text>
      </ListRowBody>
      <ListRowChevron />
    </ListRow>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    listContent: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    statusBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      color: Brand.primary,
    },
    rowTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    rowTeam: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
