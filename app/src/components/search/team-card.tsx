import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FlameIcon, SportIcon } from '@/components/icons';
import { Brand, LevelColors, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { LevelLabels, RecruitmentTypeLabels, SportLabels } from '@/types/recruitment';
import type { Team } from '@/types/team';

interface Props {
  team: Team;
  onPress?: (team: Team) => void;
}

/** チームでさがす画面の1行カード(チームLPの入口) */
export function TeamCard({ team, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={() => onPress?.(team)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: team.photo }} style={styles.photo} contentFit="cover" />
      <View style={styles.body}>
        <View style={styles.nameRow}>
          <SportIcon sport={team.sport} size={14} color={colors.text} />
          <Text style={styles.name} numberOfLines={1}>
            {team.name}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {[
              SportLabels[team.sport],
              team.ward,
              team.memberCount != null
                ? `${team.memberCount}人${team.ageRange ? `(${team.ageRange})` : ''}`
                : undefined,
            ]
              .filter(Boolean)
              .join(' ・ ')}
          </Text>
        </View>

        <Text style={styles.bio} numberOfLines={1}>
          {team.bio}
        </Text>

        <View style={styles.badgeRow}>
          <View style={[styles.levelBadge, { borderColor: LevelColors[team.level] }]}>
            {team.level === 'serious' && (
              <FlameIcon size={10} color={LevelColors[team.level]} />
            )}
            <Text style={[styles.levelText, { color: LevelColors[team.level] }]}>
              {LevelLabels[team.level]}
            </Text>
          </View>
          {team.recruiting.length > 0 ? (
            team.recruiting.map((r) => (
              <View key={r} style={styles.recruitBadge}>
                <Text style={styles.recruitText}>{RecruitmentTypeLabels[r]}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noRecruit}>現在募集なし</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      gap: Spacing.two,
      backgroundColor: c.background,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      padding: Spacing.two,
    },
    pressed: {
      opacity: 0.85,
    },
    photo: {
      width: 72,
      height: 72,
      borderRadius: 10,
      backgroundColor: c.backgroundElement,
    },
    body: {
      flex: 1,
      gap: 3,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    name: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    metaRow: {
      flexDirection: 'row',
    },
    metaText: {
      fontSize: 11,
      color: c.textSecondary,
    },
    bio: {
      fontSize: 11,
      color: c.textSecondary,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
      marginTop: 2,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    levelText: {
      fontSize: 10,
      fontWeight: '700',
    },
    recruitBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    recruitText: {
      fontSize: 10,
      fontWeight: '700',
      color: Brand.primary,
    },
    noRecruit: {
      fontSize: 10,
      color: c.textSecondary,
    },
  });
