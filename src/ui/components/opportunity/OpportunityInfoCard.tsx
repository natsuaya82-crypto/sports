import { formatMonthDayWithWeekday } from '@/lib/local-date';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import {
  getEndTime,
  getOpportunityDate,
  getStartTime,
  isScheduled,
  type Opportunity,
} from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';



/**
 * 日時の表示文字列。日程未定の常設募集は行ごと出さないため null を返す。
 * 意味のない既定値で埋めない（docs/ARCHITECTURE.md 第11章）。
 */
function formatSchedule(opportunity: Opportunity): string | null {
  if (!isScheduled(opportunity)) return null;
  const date = getOpportunityDate(opportunity);
  if (date === null) return null;
  return `${formatMonthDayWithWeekday(date)} ${getStartTime(opportunity)}〜${getEndTime(opportunity)}`;
}

/** 募集詳細の開催情報 */
export function OpportunityInfoCard({ opportunity }: { opportunity: Opportunity }) {
  const styles = useThemedStyles(makeStyles);
  const schedule = formatSchedule(opportunity);

  return (
    <View style={styles.infoCard}>
      {schedule !== null && (
        <InfoRow icon="calendar-outline" label="日時" value={schedule} />
      )}
      <InfoRow
        icon="location-outline"
        label="場所"
        value={`${opportunity.location.name}(${opportunity.location.ward})`}
      />
      <InfoRow
        icon="cash-outline"
        label="参加費"
        value={opportunity.fee === 0 ? '無料' : `¥${opportunity.fee.toLocaleString()}`}
      />
      <InfoRow
        icon="pricetag-outline"
        label="競技"
        value={getSportLabel(opportunity.sport)}
      />
      <InfoRow
        icon="people-outline"
        label="募集人数"
        value={`${opportunity.capacity}人(${opportunity.filledCount}人参加済み)`}
      />
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 10,
      marginTop: Spacing.one,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    infoLabel: {
      width: 56,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
  });
