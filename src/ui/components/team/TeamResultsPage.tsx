import { StyleSheet, Text, View } from 'react-native';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamPageTitle } from './TeamPageTitle';

/** 戦績ページ */
export function TeamResultsPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="RESULTS" jp="出場大会・戦績" color={team.color} />
      {(team.achievements ?? []).map((a) => (
        <View key={a} style={styles.resultRow}>
          <View style={[styles.resultDot, { backgroundColor: team.color }]} />
          <Text style={styles.resultText}>{a}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    resultDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    resultText: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
  });
