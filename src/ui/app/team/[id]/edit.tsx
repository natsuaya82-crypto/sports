import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { RowGroup } from '@/ui/components/row/RowGroup';
import { SettingRow } from '@/ui/components/row/SettingRow';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getOpportunityKindLabel } from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';
import { useTeam } from '@/ui/hooks/use-teams';
import type { EditSection } from './edit/[section]';

/**
 * 公式サイトの編集メニュー。
 * 1ページに全項目を詰めず、項目ごとに小さな編集画面へ分ける。
 */
export default function TeamEditMenuScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);

  if (!team) {
    return (
      <NotFoundScreen message="チームが見つかりませんでした" />
    );
  }

  // 活動情報の入力済み数(未入力でもOKであることが伝わる見せ方)
  const activityFilled = [
    team.homeGround,
    team.schedule,
    team.memberCount,
    team.ageRange,
    team.founded,
    team.instagram,
  ].filter((v) => v != null && v !== '').length;

  const rows: {
    key: EditSection;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    preview: string;
  }[] = [
    {
      key: 'basic',
      icon: 'create-outline',
      title: '基本情報',
      preview: `${team.name} ・ ${getSportLabel(team.sport)}`,
    },
    {
      key: 'color',
      icon: 'color-palette-outline',
      title: 'チームカラー',
      preview: 'サイト全体の配色',
    },
    {
      key: 'activity',
      icon: 'time-outline',
      title: '活動情報',
      preview: `${activityFilled}/6項目を入力済み`,
    },
    {
      key: 'recruiting',
      icon: 'megaphone-outline',
      title: '募集している種別',
      preview:
        team.recruitingKinds.length > 0
          ? team.recruitingKinds.map((r) => getOpportunityKindLabel(r)).join('・')
          : '募集なし',
    },
    {
      key: 'news',
      icon: 'newspaper-outline',
      title: 'お知らせ',
      preview: `${team.news?.length ?? 0}件`,
    },
    {
      key: 'achievements',
      icon: 'trophy-outline',
      title: '出場大会・戦績',
      preview: `${team.achievements?.length ?? 0}件`,
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="公式サイトを編集" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* いまのサイトの顔(色+キャッチコピー)を常に見せる */}
        <View style={[styles.preview, { backgroundColor: team.color }]}>
          <Text style={styles.previewName}>{team.name}</Text>
          <Text style={styles.previewTagline}>{team.tagline || 'キャッチコピー未設定'}</Text>
        </View>

        <RowGroup>
          {rows.map((r) => (
            <SettingRow
              key={r.key}
              icon={r.icon}
              iconSize={18}
              label={r.title}
              description={r.preview}
              descriptionLines={1}
              trailing={
                <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
              }
              onPress={() =>
                router.push({
                  pathname: '/team/[id]/edit/[section]',
                  params: { id: team.id, section: r.key },
                })
              }
            />
          ))}
        </RowGroup>

        <Pressable
          style={styles.siteLink}
          onPress={() =>
            router.push({ pathname: '/team/[id]', params: { id: team.id } })
          }>
          <Ionicons name="globe-outline" size={16} color={team.color} />
          <Text style={[styles.siteLinkText, { color: team.color }]}>
            公式サイトを確認する
          </Text>
        </Pressable>

        <Text style={styles.note}>
          メンバーと試合日程・結果の編集は「メンバー管理」から行えるようにする予定です
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    content: { padding: Spacing.three, gap: Spacing.three },
    preview: {
      borderRadius: 12,
      padding: Spacing.three,
      gap: 2,
    },
    previewName: {
      fontSize: 16,
      fontWeight: '800',
      color: '#ffffff',
    },
    previewTagline: {
      fontSize: 12,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.85)',
    },
    siteLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
    },
    siteLinkText: {
      fontSize: 13,
      fontWeight: '700',
    },
    note: {
      fontSize: 11,
      lineHeight: 17,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
