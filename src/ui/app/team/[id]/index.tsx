import { Screen } from '@/ui/components/Screen';
import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { compareByOpportunityDate } from '@/ui/components/team/site-format';
import { makeSiteStyles } from '@/ui/components/team/site-styles';
import type { SiteTab } from '@/ui/components/team/site-tab';
import { TeamSiteFooter } from '@/ui/components/team/TeamSiteFooter';
import { TeamSiteHeader } from '@/ui/components/team/TeamSiteHeader';
import { TeamSitePage } from '@/ui/components/team/TeamSitePage';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import { useTeam } from '@/ui/hooks/use-teams';
import { Spacing } from '@/ui/theme';

/**
 * チーム公式サイト。1枚もののプロフィールではなく、
 * ヘッダー+メニューで複数ページを切り替える「本物のクラブサイト」の構造。
 * TOPはダイジェスト、詳細は各ページへ。
 */
export default function TeamSiteScreen() {
  const site = useThemedStyles(makeSiteStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const allOpportunities = useOpportunities();
  const [tab, setTab] = useState<SiteTab>('top');
  // PC幅のWebサイトレイアウト(中央1080px+TOPは2カラム)は一旦オフ。
  // _layout.tsx の TEAM_SITE_FULL_WIDTH と合わせて復活させる
  const DESKTOP_LAYOUT_ENABLED = false;
  const { width } = useWindowDimensions();
  const isDesktop = DESKTOP_LAYOUT_ENABLED && width >= 900;

  const opportunities = useMemo(() => {
    if (!team) return [];
    return allOpportunities
      .filter((o) => o.hostTeamId === team.id)
      .sort(compareByOpportunityDate);
  }, [team, allOpportunities]);

  if (!team) {
    return (
      <NotFoundScreen message="チームが見つかりませんでした" showBack />
    );
  }

  return (
    <Screen edges={[]}>
      <TeamSiteHeader team={team} tab={tab} onSelect={setTab} isDesktop={isDesktop} />

      {/* ページ本体 */}
      <ScrollView
        key={tab}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}>
        <View style={site.innerWide}>
          <TeamSitePage
            team={team}
            tab={tab}
            opportunities={opportunities}
            isDesktop={isDesktop}
            onNavigate={setTab}
          />
        </View>

        <TeamSiteFooter team={team} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pageContent: {
    paddingBottom: Spacing.four,
  },
});
