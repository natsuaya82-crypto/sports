import { Screen } from '@/ui/components/Screen';
import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { RowGroup } from '@/ui/components/row/RowGroup';
import { TeamManageRow } from '@/ui/components/team/TeamManageRow';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getSportLabel } from '@/domain/sport';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import { useTeam } from '@/ui/hooks/use-teams';

/** チーム管理ダッシュボード(マイページの運営チームから入る) */
export default function TeamManageScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const opportunities = useOpportunities();

  const activeCount = useMemo(
    () => (team ? opportunities.filter((o) => o.hostTeamId === team.id).length : 0),
    [team, opportunities],
  );

  if (!team) {
    return (
      <NotFoundScreen message="チームが見つかりませんでした" />
    );
  }

  const go = (
    pathname:
      | '/team/[id]'
      | '/team/[id]/edit'
      | '/team/[id]/applicants'
      | '/team/[id]/members'
      | '/post'
      | '/scout',
  ) => {
    if (pathname === '/post' || pathname === '/scout') router.push(pathname);
    else router.push({ pathname, params: { id: team.id } });
  };

  return (
    <Screen>
      <ScreenHeader title="チーム管理" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* チームヘッダー(カラー) */}
        <View style={[styles.teamCard, { backgroundColor: team.color }]}>
          <Image source={{ uri: team.photo }} style={styles.teamPhoto} />
          <View style={styles.teamBody}>
            <View style={styles.teamNameRow}>
              <SportIcon sport={team.sport} size={14} color="#ffffff" />
              <Text style={styles.teamName} numberOfLines={1}>
                {team.name}
              </Text>
            </View>
            <Text style={styles.teamMeta}>
              {getSportLabel(team.sport)} ・ {team.ward} ・ 代表
            </Text>
          </View>
        </View>

        {/* 公式サイト */}
        <View style={styles.siteButtons}>
          <Pressable
            style={[styles.siteButton, { backgroundColor: team.color }]}
            onPress={() => go('/team/[id]')}>
            <Ionicons name="globe-outline" size={16} color="#ffffff" />
            <Text style={styles.siteButtonText}>公式サイトを見る</Text>
          </Pressable>
          <Pressable style={styles.siteButtonSub} onPress={() => go('/team/[id]/edit')}>
            <Ionicons name="create-outline" size={16} color={colors.text} />
            <Text style={styles.siteButtonSubText}>編集</Text>
          </Pressable>
        </View>

        {/* 管理メニュー */}
        <Text style={styles.sectionTitle}>運営</Text>
        <RowGroup>
          <TeamManageRow
            icon="megaphone-outline"
            label="募集をつくる・管理"
            note={`${activeCount}件`}
            onPress={() => go('/post')}
          />
          <TeamManageRow
            icon="mail-open-outline"
            label="応募者の確認"
            badge="新着 2"
            onPress={() => go('/team/[id]/applicants')}
          />
          <TeamManageRow
            icon="search-outline"
            label="個人をスカウト"
            onPress={() => go('/scout')}
          />
          <TeamManageRow
            icon="people-outline"
            label="メンバー管理"
            onPress={() => go('/team/[id]/members')}
          />
          <TeamManageRow
            icon="settings-outline"
            label="チーム設定"
            onPress={() => go('/team/[id]/edit')}
            last
          />
        </RowGroup>

      </ScrollView>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    content: { padding: Spacing.three, gap: Spacing.two },
    teamCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderRadius: 12,
      padding: Spacing.three,
    },
    teamPhoto: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    teamBody: {
      flex: 1,
      gap: 3,
    },
    teamNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    teamName: {
      flex: 1,
      fontSize: 16,
      fontWeight: '800',
      color: '#ffffff',
    },
    teamMeta: {
      fontSize: 11,
      fontWeight: '600',
      color: 'rgba(255,255,255,0.85)',
    },
    siteButtons: {
      flexDirection: 'row',
      gap: Spacing.two,
      marginTop: Spacing.one,
    },
    siteButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 13,
    },
    siteButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#ffffff',
    },
    siteButtonSub: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      borderRadius: 999,
      paddingHorizontal: Spacing.four,
      paddingVertical: 13,
      backgroundColor: c.backgroundElement,
    },
    siteButtonSubText: {
      fontSize: 13,
      fontWeight: '800',
      color: c.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
    },
    note: {
      fontSize: 11,
      lineHeight: 17,
      color: c.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.two,
    },
  });
