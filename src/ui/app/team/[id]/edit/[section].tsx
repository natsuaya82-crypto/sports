import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { updateTeam } from '@/data/team-store';
import type { Team } from '@/domain/team';
import { TeamAchievementsForm } from '@/ui/components/team/TeamAchievementsForm';
import { TeamActivityForm } from '@/ui/components/team/TeamActivityForm';
import { TeamBasicForm } from '@/ui/components/team/TeamBasicForm';
import { TeamColorForm } from '@/ui/components/team/TeamColorForm';
import { TeamNewsForm } from '@/ui/components/team/TeamNewsForm';
import { TeamRecruitingForm } from '@/ui/components/team/TeamRecruitingForm';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useTeam } from '@/ui/hooks/use-teams';
import { Palette, Spacing } from '@/ui/theme';

/** 編集画面のセクション */
export type EditSection =
  | 'basic'
  | 'color'
  | 'activity'
  | 'recruiting'
  | 'news'
  | 'achievements';

const SECTION_TITLES: Record<EditSection, string> = {
  basic: '基本情報',
  color: 'チームカラー',
  activity: '活動情報',
  recruiting: '募集している種別',
  news: 'お知らせ',
  achievements: '出場大会・戦績',
};

/** 項目ごとの編集画面(編集メニューから遷移) */
export default function TeamEditSectionScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id, section } = useLocalSearchParams<{ id: string; section: EditSection }>();
  const team = useTeam(id);

  if (!team || !section || !(section in SECTION_TITLES)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>ページが見つかりませんでした</Text>
        </View>
      </SafeAreaView>
    );
  }

  const save = (patch: Partial<Omit<Team, 'id'>>) => {
    updateTeam(team.id, patch);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{SECTION_TITLES[section]}</Text>
        <View style={styles.headerSide} />
      </View>

      {section === 'basic' && <TeamBasicForm team={team} onSave={save} />}
      {section === 'color' && <TeamColorForm team={team} onSave={save} />}
      {section === 'activity' && <TeamActivityForm team={team} onSave={save} />}
      {section === 'recruiting' && <TeamRecruitingForm team={team} onSave={save} />}
      {section === 'news' && <TeamNewsForm team={team} onSave={save} />}
      {section === 'achievements' && <TeamAchievementsForm team={team} onSave={save} />}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerSide: {
      width: 32,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
  });
