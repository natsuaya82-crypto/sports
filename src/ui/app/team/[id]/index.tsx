import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { compareByOpportunityDate } from '@/ui/components/team/site-format';
import { makeSiteStyles } from '@/ui/components/team/site-styles';
import type { SiteTab } from '@/ui/components/team/site-tab';
import { TeamAboutPage } from '@/ui/components/team/TeamAboutPage';
import { TeamGalleryPage } from '@/ui/components/team/TeamGalleryPage';
import { TeamMembersPage } from '@/ui/components/team/TeamMembersPage';
import { TeamNewsPage } from '@/ui/components/team/TeamNewsPage';
import { TeamRecruitPage } from '@/ui/components/team/TeamRecruitPage';
import { TeamResultsPage } from '@/ui/components/team/TeamResultsPage';
import { TeamSchedulePage } from '@/ui/components/team/TeamSchedulePage';
import { TeamSiteFooter } from '@/ui/components/team/TeamSiteFooter';
import { TeamSiteHeader } from '@/ui/components/team/TeamSiteHeader';
import { TeamTopPage } from '@/ui/components/team/TeamTopPage';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import { useTeam } from '@/ui/hooks/use-teams';
import { Palette, Spacing } from '@/ui/theme';

/**
 * チーム公式サイト。1枚もののプロフィールではなく、
 * ヘッダー+メニューで複数ページを切り替える「本物のクラブサイト」の構造。
 * TOPはダイジェスト、詳細は各ページへ。
 */
export default function TeamSiteScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
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
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>チームが見つかりませんでした</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notFoundBack}>もどる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <TeamSiteHeader team={team} tab={tab} onSelect={setTab} isDesktop={isDesktop} />

      {/* ページ本体 */}
      <ScrollView
        key={tab}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}>
        <View style={site.innerWide}>
          {tab === 'top' && (
            <TeamTopPage
              team={team}
              opportunities={opportunities}
              onNavigate={setTab}
              isDesktop={isDesktop}
            />
          )}
          {tab === 'news' && <TeamNewsPage team={team} />}
          {tab === 'schedule' && <TeamSchedulePage team={team} />}
          {tab === 'members' && <TeamMembersPage team={team} isDesktop={isDesktop} />}
          {tab === 'recruit' && (
            <TeamRecruitPage team={team} opportunities={opportunities} />
          )}
          {tab === 'results' && <TeamResultsPage team={team} />}
          {tab === 'gallery' && <TeamGalleryPage team={team} isDesktop={isDesktop} />}
          {tab === 'about' && <TeamAboutPage team={team} />}
        </View>

        <TeamSiteFooter team={team} />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    pageContent: {
      paddingBottom: Spacing.four,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    notFoundBack: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
  });
