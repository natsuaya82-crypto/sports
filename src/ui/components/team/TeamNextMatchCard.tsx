import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TeamMatch } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { formatDateWithWeekday } from './site-format';

/** TOPの次戦カード */
export function TeamNextMatchCard({
  match,
  color,
  onPress,
}: {
  match: TeamMatch;
  color: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.nextMatch, { borderColor: color, backgroundColor: `${color}0D` }]}>
      <View style={styles.nextMatchHead}>
        <Text style={[styles.nextMatchLabel, { color }]}>NEXT MATCH</Text>
        {match.competition && (
          <Text style={styles.nextMatchCompetition}>{match.competition}</Text>
        )}
      </View>
      <Text style={styles.nextMatchOpponent}>vs {match.opponent}</Text>
      <Text style={styles.nextMatchMeta}>
        {formatDateWithWeekday(match.date)}
        {match.time ? ` ${match.time}〜` : ''}
        {match.venue ? ` @ ${match.venue}` : ''}
      </Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    nextMatch: {
      borderWidth: 1.5,
      borderRadius: 12,
      padding: Spacing.three,
      gap: 4,
      marginTop: Spacing.two,
    },
    nextMatchHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    nextMatchLabel: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
    },
    nextMatchCompetition: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    nextMatchOpponent: {
      fontSize: 20,
      fontWeight: '900',
      color: c.text,
    },
    nextMatchMeta: {
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
  });
