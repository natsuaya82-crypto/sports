import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { getLevelLabel } from '@/domain/level';
import { getSportLabel } from '@/domain/sport';
import type { Team } from '@/domain/team';
import { FlameIcon } from '@/ui/components/Icons';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { LevelColors, Palette, Spacing } from '@/ui/theme';

/** TOPのヒーローと、決まっているものだけ並べるスタッツ */
export function TeamSiteHero({ team, isDesktop }: { team: Team; isDesktop: boolean }) {
  const styles = useThemedStyles(makeStyles);

  const stats: { value: string; label: string; small?: boolean }[] = [
    ...(team.founded != null ? [{ value: `${team.founded}`, label: '創設' }] : []),
    ...(team.memberCount != null
      ? [{ value: `${team.memberCount}`, label: 'メンバー' }]
      : []),
    ...(team.ageRange != null ? [{ value: team.ageRange, label: '年齢層', small: true }] : []),
  ];

  return (
    <View>
      {/* ヒーロー */}
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <Image source={{ uri: team.photo }} style={styles.heroImage} contentFit="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.heroGradient}
        />
        <View style={styles.heroContent}>
          <Text style={[styles.heroTagline, isDesktop && styles.heroTaglineDesktop]}>
            {team.tagline}
          </Text>
          <View style={styles.heroChips}>
            <View style={styles.heroChip}>
              <Text style={styles.heroChipText}>
                {getSportLabel(team.sport)} ・ {team.ward}
              </Text>
            </View>
            <View style={[styles.heroChip, { backgroundColor: LevelColors[team.level] }]}>
              {team.level === 'serious' && <FlameIcon size={10} color="#ffffff" />}
              <Text style={styles.heroChipText}>{getLevelLabel(team.level)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* スタッツ(決まっているものだけ) */}
      {stats.length > 0 && (
        <View style={styles.statsBand}>
          {stats.map((s, i) => (
            <View key={s.label} style={styles.statsItem}>
              {i > 0 && <View style={styles.statDivider} />}
              <View style={styles.statTile}>
                <Text
                  style={[
                    styles.statValue,
                    { color: team.color },
                    s.small && styles.statValueSmall,
                  ]}>
                  {s.value}
                </Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    hero: {
      height: 200,
    },
    heroDesktop: {
      height: 340,
    },
    heroImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.backgroundElement,
    },
    heroGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    heroContent: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      gap: 6,
    },
    heroTagline: {
      fontSize: 18,
      fontWeight: '900',
      color: '#ffffff',
    },
    heroTaglineDesktop: {
      fontSize: 30,
    },
    heroChips: {
      flexDirection: 'row',
      gap: 6,
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroChipText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#ffffff',
    },
    statsBand: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    statsItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    statTile: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '900',
    },
    statValueSmall: {
      fontSize: 15,
      lineHeight: 26,
    },
    statLabel: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
    },
    statDivider: {
      width: StyleSheet.hairlineWidth,
      height: 32,
      backgroundColor: c.border,
    },
  });
