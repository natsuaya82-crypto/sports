import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useOpportunity } from '@/ui/hooks/use-opportunities';
import { getApplicationsByApplicant, type Application } from '@/domain/application';

/** 応募履歴(マイページから) */
export default function ApplicationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const currentUser = useCurrentUser();
  const applications = useApplications();

  const myApplications = useMemo(
    () => getApplicationsByApplicant(applications, currentUser.id),
    [applications, currentUser.id],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>応募履歴</Text>
        <View style={styles.headerSide} />
      </View>
      <FlatList
        data={myApplications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ApplicationRow application={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだ応募がありません</Text>
            <Text style={styles.emptyHint}>気になる募集に応募すると、ここに並びます</Text>
          </View>
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
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const opportunity = useOpportunity(application.opportunityId);
  if (opportunity === undefined) return null;

  return (
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({
          pathname: '/opportunity/[id]',
          params: { id: application.opportunityId },
        })
      }>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>応募済み</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {opportunity.title}
        </Text>
        <Text style={styles.rowTeam}>{opportunity.hostTeamName}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerSide: {
      width: 32,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    listContent: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
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
    rowBody: {
      flex: 1,
      gap: 2,
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
    empty: {
      alignItems: 'center',
      paddingTop: 80,
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    emptyHint: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
