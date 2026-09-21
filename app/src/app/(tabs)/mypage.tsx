import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShieldIcon, SportIcon } from '@/components/icons';
import { Brand, Palette, Spacing } from '@/constants/theme';
import { useCurrentUser } from '@/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { useTeams } from '@/data/team-store';
import { LevelLabels, RecruitmentTypeLabels, SportLabels } from '@/types/recruitment';
import type { Team } from '@/types/team';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  href?:
    | '/settings'
    | '/applications'
    | '/favorites'
    | '/schedule'
    | '/notifications';
}

/** 自分(個人)のメニュー。チームは下の一覧で別扱いにする */
const PERSONAL_MENU: MenuItem[] = [
  { icon: 'paper-plane-outline', label: '応募履歴', href: '/applications' },
  { icon: 'calendar-outline', label: '参加予定', href: '/schedule' },
  { icon: 'heart-outline', label: 'おきにいり', href: '/favorites' },
  { icon: 'notifications-outline', label: '通知設定', href: '/notifications' },
  { icon: 'settings-outline', label: 'アカウント設定', href: '/settings' },
];

/**
 * マイページ。
 * 「個人/チーム切り替え」はやめ、常に自分として表示する。
 * 運営するチームは持ち物として一覧に並べ、タップで各チームの管理画面に入る。
 */
export default function MyPageScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const user = useCurrentUser();
  const teams = useTeams();

  const managedTeams = useMemo(
    () => teams.filter((t) => user.managedTeamIds.includes(t.id)),
    [teams, user],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.screenTitle}>マイページ</Text>

        {/* 自分のプロフィール */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />
          <View style={styles.profileBody}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user.displayName}
            </Text>
            <View style={styles.sportsRow}>
              {user.sports.length === 0 ? (
                <Text style={styles.profileMeta}>種目は未設定</Text>
              ) : (
                user.sports.map((s) => (
                  <View key={s} style={styles.sportChip}>
                    <SportIcon sport={s} size={11} color={colors.tagText} />
                    <Text style={styles.sportChipText}>{SportLabels[s]}</Text>
                  </View>
                ))
              )}
            </View>
            <Text style={styles.profileMeta}>
              {[user.ward || 'エリア未設定', LevelLabels[user.level]].join(' ・ ')}
            </Text>
          </View>
        </View>
        <Pressable
          style={styles.editProfileButton}
          onPress={() => router.push('/profile-edit')}>
          <Ionicons name="create-outline" size={15} color={colors.text} />
          <Text style={styles.editProfileText}>プロフィールを編集</Text>
        </Pressable>

        {/* 個人メニュー */}
        <View style={styles.menuList}>
          {PERSONAL_MENU.map((m) => (
            <Pressable
              key={m.label}
              style={styles.menuItem}
              onPress={m.href ? () => router.push(m.href!) : undefined}>
              <Ionicons name={m.icon} size={18} color={colors.text} />
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>

        {/* 運営するチーム */}
        <Text style={styles.sectionTitle}>運営するチーム</Text>
        <View style={styles.teamList}>
          {managedTeams.map((t) => (
            <TeamRow
              key={t.id}
              team={t}
              onPress={() =>
                router.push({ pathname: '/team/[id]/manage', params: { id: t.id } })
              }
            />
          ))}
          <Pressable style={styles.createTeamRow}>
            <Ionicons name="add" size={18} color={Brand.primary} />
            <Text style={styles.createTeamText}>新しいチームを作る</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/** 運営チームの1行 */
function TeamRow({ team, onPress }: { team: Team; onPress: () => void }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={styles.teamRow} onPress={onPress}>
      <Image source={{ uri: team.photo }} style={styles.teamPhoto} />
      <View style={styles.teamBody}>
        <View style={styles.teamNameRow}>
          <SportIcon sport={team.sport} size={13} color={colors.text} />
          <Text style={styles.teamName} numberOfLines={1}>
            {team.name}
          </Text>
        </View>
        <View style={styles.teamBadges}>
          <Text style={styles.teamMeta}>代表</Text>
          {team.recruiting.length > 0 && (
            <View style={styles.recruitBadge}>
              <Text style={styles.recruitText}>
                {team.recruiting.map((r) => RecruitmentTypeLabels[r]).join('・')}
              </Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 88,
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 12,
      padding: Spacing.three,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.backgroundSelected,
    },
    profileBody: {
      flex: 1,
      gap: 4,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
    },
    sportsRow: {
      flexDirection: 'row',
      gap: 4,
      flexWrap: 'wrap',
    },
    sportChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.tagBackground,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    sportChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: c.tagText,
    },
    profileMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    editProfileText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    menuList: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      marginTop: Spacing.two,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    menuLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.three,
    },
    teamList: {
      gap: Spacing.two,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    teamPhoto: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: c.backgroundElement,
    },
    teamBody: {
      flex: 1,
      gap: 3,
    },
    teamNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    teamName: {
      flex: 1,
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    teamBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexWrap: 'wrap',
    },
    teamMeta: {
      fontSize: 10,
      fontWeight: '700',
      color: c.textSecondary,
    },
    recruitBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    recruitText: {
      fontSize: 10,
      fontWeight: '700',
      color: Brand.primary,
    },
    createTeamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: Brand.primary,
    },
    createTeamText: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.primary,
    },
  });
