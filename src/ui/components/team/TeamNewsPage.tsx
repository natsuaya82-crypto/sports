import { formatMonthDay } from '@/lib/local-date';
import { StyleSheet, Text, View } from 'react-native';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamPageTitle } from './TeamPageTitle';

/** お知らせページ */
export function TeamNewsPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="NEWS" jp="お知らせ" color={team.color} />
      {(team.news ?? []).map((n) => (
        <View key={`${n.date}-${n.text}`} style={styles.newsCard}>
          <Text style={[site.newsDate, { color: team.color }]}>{formatMonthDay(n.date)}</Text>
          <Text style={site.newsText}>{n.text}</Text>
        </View>
      ))}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    newsCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      gap: 4,
    },
  });
