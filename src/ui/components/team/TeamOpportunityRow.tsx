import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Opportunity } from '@/domain/opportunity';
import {
  getEndTime,
  getOpportunityDate,
  getOpportunityKindLabel,
  getRemainingCapacity,
  getStartTime,
  isOpen,
} from '@/domain/opportunity';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getOpportunityKindColor, Palette, Spacing } from '@/ui/theme';

import { formatDate } from './site-format';

/** 募集枠1行(タップで募集詳細へ) */
export function TeamOpportunityRow({ item }: { item: Opportunity }) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const remaining = getRemainingCapacity(item);
  const isClosed = !isOpen(item);

  // 日程が決まっていない常設募集は日時の部分を持たない
  const date = getOpportunityDate(item);
  const startTime = getStartTime(item);
  const endTime = getEndTime(item);
  const fee = item.fee === 0 ? '無料' : `¥${item.fee.toLocaleString()}`;
  const schedule =
    date !== null && startTime !== null && endTime !== null
      ? `${formatDate(date)} ${startTime}〜${endTime} ・ `
      : '';

  return (
    <Pressable
      style={styles.recruitmentRow}
      onPress={() =>
        router.push({ pathname: '/opportunity/[id]', params: { id: item.id } })
      }>
      <View
        style={[
          styles.recruitmentType,
          { backgroundColor: getOpportunityKindColor(item.kind, colors.tagText) },
          isClosed && styles.recruitmentTypeClosed,
        ]}>
        <Text style={styles.recruitmentTypeText}>
          {isClosed ? '締切' : getOpportunityKindLabel(item.kind)}
        </Text>
      </View>
      <View style={styles.recruitmentBody}>
        <Text style={styles.opportunityTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.recruitmentMeta}>
          {schedule}
          {fee}
          {!isClosed && ` ・ 残り${remaining}枠`}
        </Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    recruitmentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      backgroundColor: c.background,
    },
    recruitmentType: {
      borderRadius: 6,
      paddingHorizontal: 7,
      paddingVertical: 4,
      minWidth: 64,
      alignItems: 'center',
    },
    recruitmentTypeClosed: {
      backgroundColor: c.backgroundSelected,
    },
    recruitmentTypeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
    },
    recruitmentBody: {
      flex: 1,
      gap: 2,
    },
    opportunityTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    recruitmentMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
