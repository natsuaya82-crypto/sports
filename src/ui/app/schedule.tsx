import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SportIcon } from '@/ui/components/Icons';
import { Brand, Palette, Spacing, getOpportunityKindColor } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import {
  getApplicationsByApplicant,
  isActive,
  type Application,
} from '@/domain/application';
import {
  getEndTime,
  getOpportunityDate,
  getOpportunityKindLabel,
  getStartTime,
  type Opportunity,
} from '@/domain/opportunity';

/** 参加予定1件。応募と、その応募先の募集から組み立てる */
interface ScheduleItem {
  application: Application;
  opportunity: Opportunity;
  /** `YYYY-MM-DD` */
  date: string;
  startTime: string;
  endTime: string;
}

function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
  return `${m}/${d}(${weekday})`;
}

/** 参加予定(応募が受理された・参加確定したイベント) */
export default function ScheduleScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  const currentUser = useCurrentUser();
  const applications = useApplications();
  const opportunities = useOpportunities();

  /**
   * 参加予定は自分の応募のうち生きているもの(docs/DOMAIN.md 第4章)。
   * 日程未定の常設募集は日付軸に並べられないので除く。
   */
  const data = useMemo(
    () =>
      getApplicationsByApplicant(applications, currentUser.id)
        .filter(isActive)
        .flatMap<ScheduleItem>((application) => {
          const opportunity = opportunities.find((o) => o.id === application.opportunityId);
          if (opportunity === undefined) return [];
          const date = getOpportunityDate(opportunity);
          const startTime = getStartTime(opportunity);
          const endTime = getEndTime(opportunity);
          if (date === null || startTime === null || endTime === null) return [];
          return [{ application, opportunity, date, startTime, endTime }];
        })
        .sort((a, b) => a.date.localeCompare(b.date)),
    [applications, opportunities, currentUser.id],
  );

  const renderItem = ({ item }: { item: ScheduleItem }) => (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: '/opportunity/[id]',
          params: { id: item.opportunity.id },
        })
      }>
      <View style={styles.dateCol}>
        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
        <Text style={styles.timeText}>{item.startTime}</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.cardBody}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.typeBadge,
              {
                backgroundColor: getOpportunityKindColor(
                  item.opportunity.kind,
                  colors.tagText,
                ),
              },
            ]}>
            <SportIcon sport={item.opportunity.sport} size={10} color="#ffffff" />
            <Text style={styles.typeText}>
              {getOpportunityKindLabel(item.opportunity.kind)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.application.status === 'accepted' ? styles.confirmed : styles.pending,
            ]}>
            <Text
              style={[
                styles.statusText,
                item.application.status === 'accepted'
                  ? styles.confirmedText
                  : styles.pendingText,
              ]}>
              {item.application.status === 'accepted' ? '参加確定' : '承認待ち'}
            </Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {item.opportunity.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.startTime}〜{item.endTime} ・ {item.opportunity.location.name}
        </Text>
        <Text style={styles.team} numberOfLines={1}>
          {item.opportunity.hostTeamName}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>参加予定</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.application.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>参加予定はありません</Text>
            <Text style={styles.emptyHint}>募集に応募して参加が決まると、ここに並びます</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerSide: { width: 32, alignItems: 'flex-start' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    listContent: { padding: Spacing.three, gap: Spacing.two },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    dateCol: { width: 58, alignItems: 'center', gap: 2 },
    dateText: { fontSize: 12, fontWeight: '800', color: c.text },
    timeText: { fontSize: 11, color: c.textSecondary },
    divider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: c.border },
    cardBody: { flex: 1, gap: 3 },
    badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    typeText: { fontSize: 9, fontWeight: '700', color: '#ffffff' },
    statusBadge: { borderRadius: 999, paddingHorizontal: 7, paddingVertical: 1 },
    confirmed: { backgroundColor: c.primarySoft },
    pending: { backgroundColor: c.backgroundElement },
    statusText: { fontSize: 9, fontWeight: '700' },
    confirmedText: { color: Brand.primary },
    pendingText: { color: c.textSecondary },
    title: { fontSize: 13, fontWeight: '700', color: c.text },
    meta: { fontSize: 11, color: c.textSecondary },
    team: { fontSize: 11, fontWeight: '600', color: c.textSecondary },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.two },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    emptyHint: { fontSize: 12, color: c.textSecondary, textAlign: 'center' },
  });
