import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import type { Palette } from '@/ui/theme';
import { Brand, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getOpportunityKindLabel } from '@/domain/opportunity';
import type { Team } from '@/domain/team';

/** 運営チームの1行 */
export function ManagedTeamRow({ team, onPress }: { team: Team; onPress: () => void }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={styles.teamRow} onPress={onPress}>
      <Image source={{ uri: team.photo }} style={styles.teamPhoto} />
      <View style={styles.teamBody}>
        <View style={styles.teamNameRow}>
          <SportIcon sport={team.sport} size={13} color={colors.text} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.name}
          </Text>
        </View>
        <View style={styles.teamBadges}>
          <Text style={styles.teamMeta}>代表</Text>
          {team.recruitingKinds.length > 0 && (
            <View style={styles.recruitBadge}>
              <Text style={styles.recruitText}>
                {team.recruitingKinds.map((r) => getOpportunityKindLabel(r)).join('・')}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    teamPhoto: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.backgroundElement,
    },
    teamBody: {
      flex: 1,
      gap: 3,
    },
    teamNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    teamName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    teamBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    teamMeta: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
    },
    recruitBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    recruitText: {
      fontSize: 10,
      fontWeight: '700',
      color: Brand.primary,
    },
  });
