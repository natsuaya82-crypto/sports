import { getFinishedMatches, getUpcomingMatches } from '@/domain/team';
import { formatMonthDay, formatSlashDateWithWeekday, getDateFromToday } from '@/lib/local-date';
import { StyleSheet, Text, View } from 'react-native';

import type { Team, TeamMatch } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamPageTitle } from './TeamPageTitle';

/** 日程・結果ページ */
export function TeamSchedulePage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  const upcoming = getUpcomingMatches(team.matches, getDateFromToday(0));
  const finished = getFinishedMatches(team.matches);

  return (
    <View style={site.body}>
      <TeamPageTitle en="SCHEDULE" jp="日程・結果" color={team.color} />

      {upcoming.length > 0 && (
        <>
          <Text style={site.scheduleGroup}>これからの試合</Text>
          {upcoming.map((m) => (
            <View key={`${m.date}-${m.opponent}`} style={styles.matchRow}>
              <View style={styles.matchDateCol}>
                <Text style={[styles.matchDate, { color: team.color }]}>
                  {formatSlashDateWithWeekday(m.date)}
                </Text>
                {m.time && <Text style={styles.matchTime}>{m.time}〜</Text>}
              </View>
              <View style={styles.matchBody}>
                <Text style={styles.matchOpponent}>vs {m.opponent}</Text>
                <Text style={styles.matchMeta}>
                  {[m.competition, m.venue].filter(Boolean).join(' ・ ')}
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {finished.length > 0 && (
        <>
          <Text style={site.scheduleGroup}>結果</Text>
          {finished.map((m) => (
            <FinishedMatchRow key={`${m.date}-${m.opponent}`} match={m} color={team.color} />
          ))}
        </>
      )}
    </View>
  );
}

/** 終了した試合の1行(勝敗つき) */
function FinishedMatchRow({ match, color }: { match: TeamMatch; color: string }) {
  const styles = useThemedStyles(makeStyles);
  const result = match.result;
  if (!result) return null;

  const outcome = result.our > result.their ? 'WIN' : result.our < result.their ? 'LOSE' : 'DRAW';
  const outcomeColor = outcome === 'WIN' ? color : outcome === 'LOSE' ? '#E5484D' : '#8B8D98';

  return (
    <View style={styles.matchRow}>
      <View style={[styles.matchOutcome, { backgroundColor: outcomeColor }]}>
        <Text style={styles.matchOutcomeText}>{outcome}</Text>
      </View>
      <View style={styles.matchBody}>
        <Text style={styles.matchOpponent}>
          {result.our} - {result.their}  vs {match.opponent}
        </Text>
        <Text style={styles.matchMeta}>
          {[formatMonthDay(match.date), match.competition].filter(Boolean).join(' ・ ')}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    matchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
    },
    matchDateCol: {
      width: 76,
      gap: 1,
    },
    matchDate: {
      fontSize: 12,
      fontWeight: '800',
    },
    matchTime: {
      fontSize: 11,
      color: c.textSecondary,
    },
    matchOutcome: {
      width: 52,
      borderRadius: 6,
      paddingVertical: 5,
      alignItems: 'center',
    },
    matchOutcomeText: {
      fontSize: 10,
      fontWeight: '800',
      color: '#ffffff',
    },
    matchBody: {
      flex: 1,
      gap: 2,
    },
    matchOpponent: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    matchMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
