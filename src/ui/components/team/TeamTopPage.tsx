import { getUpcomingMatches } from '@/domain/team';
import { formatMonthDay, getDateFromToday } from '@/lib/local-date';
import { StyleSheet, Text, View } from 'react-native';

import type { Opportunity } from '@/domain/opportunity';
import { isOpen } from '@/domain/opportunity';
import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import type { SiteTab } from './site-tab';
import { TeamDigestHeader } from './TeamDigestHeader';
import { TeamJoinCta } from './TeamJoinCta';
import { TeamNextMatchCard } from './TeamNextMatchCard';
import { TeamOpportunityRow } from './TeamOpportunityRow';
import { TeamSiteHero } from './TeamSiteHero';

/** TOP: 公式サイトのホーム。ヒーロー+各ページのダイジェスト */
export function TeamTopPage({
  team,
  opportunities,
  onNavigate,
  isDesktop,
}: {
  team: Team;
  opportunities: Opportunity[];
  onNavigate: (tab: SiteTab) => void;
  isDesktop: boolean;
}) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  const openOpportunities = opportunities.filter(isOpen);
  const upcoming = getUpcomingMatches(team.matches, getDateFromToday(0));

  return (
    <View>
      <TeamSiteHero team={team} isDesktop={isDesktop} />

      {/* 次の試合(あれば大きく出す。クラブサイトの定番) */}
      {upcoming.length > 0 && (
        <View style={site.body}>
          <TeamNextMatchCard
            match={upcoming[0]}
            color={team.color}
            onPress={() => onNavigate('schedule')}
          />
        </View>
      )}

      {/* PCでは「メイン(お知らせ・募集)+サイドバー(紹介・応募)」の2カラム */}
      <View style={[site.body, isDesktop && styles.topColumns]}>
        <View style={[styles.topMain, isDesktop && styles.topMainDesktop]}>
          {/* お知らせダイジェスト */}
          {team.news && team.news.length > 0 && (
            <>
              <TeamDigestHeader
                en="NEWS"
                jp="お知らせ"
                color={team.color}
                onMore={() => onNavigate('news')}
              />
              {team.news.slice(0, 2).map((n) => (
                <View key={`${n.date}-${n.text}`} style={styles.newsRow}>
                  <Text style={[site.newsDate, { color: team.color }]}>
                    {formatMonthDay(n.date)}
                  </Text>
                  <Text style={site.newsText} numberOfLines={2}>
                    {n.text}
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* 募集ダイジェスト */}
          <TeamDigestHeader
            en="RECRUIT"
            jp="募集"
            color={team.color}
            onMore={() => onNavigate('recruit')}
          />
          {openOpportunities.length === 0 ? (
            <Text style={site.emptyText}>現在募集はありません</Text>
          ) : (
            openOpportunities.slice(0, 2).map((o) => (
              <TeamOpportunityRow key={o.id} item={o} />
            ))
          )}
        </View>

        <View style={[styles.topSide, isDesktop && styles.topSideDesktop]}>
          {/* 紹介ダイジェスト */}
          <TeamDigestHeader
            en="ABOUT"
            jp="チーム紹介"
            color={team.color}
            onMore={() => onNavigate('about')}
          />
          <Text style={site.bio} numberOfLines={3}>
            {team.bio}
          </Text>

          <TeamJoinCta team={team} />
        </View>
      </View>
    </View>
  );
}

const makeStyles = (_c: Palette) =>
  StyleSheet.create({
    topColumns: {
      flexDirection: 'row',
      gap: Spacing.five,
      alignItems: 'flex-start',
    },
    topMain: {
      gap: Spacing.two,
    },
    topMainDesktop: {
      flex: 2,
    },
    topSide: {
      gap: Spacing.two,
    },
    topSideDesktop: {
      flex: 1,
    },
    newsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
  });
