import { formatMonthDay } from '@/lib/local-date';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LevelBadge } from '@/ui/components/LevelBadge';
import { ShieldIcon } from '@/ui/components/Icons';
import { OpportunityCardPhoto } from '@/ui/components/search/OpportunityCardPhoto';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import {
  Opportunity,
  getEndTime,
  getOpportunityDate,
  getRemainingCapacity,
  getStartTime,
  isOpen,
} from '@/domain/opportunity';

interface Props {
  item: Opportunity;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onPress?: (item: Opportunity) => void;
}


/** さがす画面の募集カード(グリッドの1枚) */
export function OpportunityCard({ item, isFavorite, onToggleFavorite, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const remaining = getRemainingCapacity(item);
  const isClosed = !isOpen(item);
  // 日程未定の常設募集は日付・時刻を持たない
  const date = getOpportunityDate(item);
  const startTime = getStartTime(item);
  const endTime = getEndTime(item);

  return (
    <Pressable
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <OpportunityCardPhoto
        item={item}
        isClosed={isClosed}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
      />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.timeFeeRow}>
          <View style={styles.timeCol}>
            {date !== null && <Text style={styles.dateText}>{formatMonthDay(date)}</Text>}
            {startTime !== null && endTime !== null && (
              <Text style={styles.timeText}>
                {startTime}〜{endTime}
              </Text>
            )}
          </View>
          <Text style={styles.fee}>
            {item.fee === 0 ? '無料' : `¥${item.fee.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <LevelBadge
            level={item.level}
            iconSize={10}
            style={styles.levelBadge}
            textStyle={styles.levelText}
          />
          {!isClosed && (
            <Text style={[styles.remaining, remaining <= 2 && styles.remainingFew]}>
              残り{remaining}枠
            </Text>
          )}
        </View>

        <View style={styles.placeRow}>
          <View style={styles.wardTag}>
            <Text style={styles.wardText}>{item.location.ward}</Text>
          </View>
          <View style={styles.distance}>
            <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
            <Text style={styles.distanceText}>{item.distanceKm}km</Text>
          </View>
        </View>

        <View style={styles.teamRow}>
          <ShieldIcon size={12} color={colors.textSecondary} />
          <Text style={styles.teamName} numberOfLines={1}>
            {item.hostTeamName}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: c.background,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    pressed: {
      opacity: 0.85,
    },
    body: {
      padding: Spacing.two,
      gap: 6,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      lineHeight: 17,
      color: c.text,
      minHeight: 34,
    },
    timeFeeRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    timeCol: {
      gap: 1,
    },
    dateText: {
      fontSize: 10,
      color: c.textSecondary,
    },
    timeText: {
      fontSize: 10,
      color: c.textSecondary,
    },
    fee: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    levelBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    levelText: {
      fontSize: 10,
    },
    remaining: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    remainingFew: {
      color: Brand.danger,
    },
    placeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    wardTag: {
      backgroundColor: c.tagBackground,
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    wardText: {
      fontSize: 10,
      fontWeight: '600',
      color: c.tagText,
    },
    distance: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    distanceText: {
      fontSize: 11,
      color: c.textSecondary,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
      paddingTop: 6,
    },
    teamName: {
      flex: 1,
      fontSize: 11,
      fontWeight: '600',
      color: c.text,
    },
  });
