import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlameIcon, ShieldIcon, SportIcon } from '@/ui/components/Icons';
import {
  Brand,
  LevelColors,
  Palette,
  Spacing,
  getOpportunityKindColor,
} from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getLevelLabel } from '@/domain/level';
import {
  Opportunity,
  getEndTime,
  getOpportunityDate,
  getOpportunityKindLabel,
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

function formatDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日`;
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
      <View style={styles.photoWrap}>
        <Image source={{ uri: item.photo }} style={styles.photo} contentFit="cover" />
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getOpportunityKindColor(item.kind, colors.tagText) },
          ]}>
          <SportIcon sport={item.sport} size={11} color="#ffffff" />
          <Text style={styles.typeBadgeText}>{getOpportunityKindLabel(item.kind)}</Text>
        </View>
        <Pressable
          onPress={() => onToggleFavorite(item.id)}
          hitSlop={8}
          style={styles.heartButton}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? Brand.danger : '#ffffff'}
          />
        </Pressable>
        {isClosed && (
          <View style={styles.closedOverlay}>
            <View style={styles.closedRibbon}>
              <Text style={styles.closedText}>締切</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.timeFeeRow}>
          <View style={styles.timeCol}>
            {date !== null && <Text style={styles.dateText}>{formatDate(date)}</Text>}
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
          <View style={[styles.levelBadge, { borderColor: LevelColors[item.level] }]}>
            {item.level === 'serious' && (
              <FlameIcon size={10} color={LevelColors[item.level]} />
            )}
            <Text style={[styles.levelText, { color: LevelColors[item.level] }]}>
              {getLevelLabel(item.level)}
            </Text>
          </View>
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
    photoWrap: {
      aspectRatio: 4 / 3,
    },
    photo: {
      width: '100%',
      height: '100%',
      backgroundColor: c.backgroundElement,
    },
    typeBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    typeBadgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
    },
    heartButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    closedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.veil,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closedRibbon: {
      backgroundColor: Brand.danger,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 4,
      transform: [{ rotate: '-12deg' }],
    },
    closedText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    levelText: {
      fontSize: 10,
      fontWeight: '700',
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
