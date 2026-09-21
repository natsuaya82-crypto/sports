import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LevelBadge } from '@/ui/components/LevelBadge';
import { SportIcon } from '@/ui/components/Icons';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getOpportunityKindLabel } from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';
import type { Team } from '@/domain/team';

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
              getSportLabel(team.sport),
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
          <LevelBadge
            level={team.level}
            iconSize={10}
            style={styles.levelBadge}
            textStyle={styles.levelText}
          />
          {team.recruitingKinds.length > 0 ? (
            team.recruitingKinds.map((r) => (
              <View key={r} style={styles.recruitBadge}>
                <Text style={styles.recruitText}>{getOpportunityKindLabel(r)}</Text>
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
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    levelText: {
      fontSize: 10,
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
