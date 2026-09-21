import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ScreenTitle } from '@/ui/components/list/ScreenTitle';
import { Screen } from '@/ui/components/Screen';
import { ManagedTeamRow } from '@/ui/components/profile/ManagedTeamRow';
import { ProfileSummary } from '@/ui/components/profile/ProfileSummary';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useTeams } from '@/ui/hooks/use-teams';

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
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenTitle title="マイページ" />

        {/* 自分のプロフィール */}
        <ProfileSummary user={user} onEdit={() => router.push('/profile-edit')} />

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
            <ManagedTeamRow
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
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 88,
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
