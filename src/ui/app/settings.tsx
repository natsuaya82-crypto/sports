import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAuth } from '@/ui/contexts/auth-context';
import {
  ThemeMode,
  useAppTheme,
  useThemedStyles,
} from '@/ui/contexts/theme-context';

const THEME_OPTIONS: {
  key: ThemeMode;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'system',
    label: '端末の設定に合わせる',
    description: 'OSのライト/ダーク設定に自動で追従します',
    icon: 'phone-portrait-outline',
  },
  {
    key: 'light',
    label: 'ライト',
    description: '常に明るいテーマで表示します',
    icon: 'sunny-outline',
  },
  {
    key: 'dark',
    label: 'ダーク',
    description: '常に暗いテーマで表示します',
    icon: 'moon-outline',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, mode, setMode } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>アカウント設定</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* テーマ */}
        <Text style={styles.sectionTitle}>テーマ</Text>
        <View style={styles.optionList}>
          {THEME_OPTIONS.map((opt) => {
            const selected = mode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setMode(opt.key)}
                style={[styles.option, selected && styles.optionSelected]}>
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={selected ? Brand.primary : colors.textSecondary}
                />
                <View style={styles.optionBody}>
                  <Text style={styles.optionLabel}>{opt.label}</Text>
                  <Text style={styles.optionDescription}>{opt.description}</Text>
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? Brand.primary : colors.textSecondary}
                />
              </Pressable>
            );
          })}
        </View>

        {/* 今後の設定項目の置き場 */}
        <Text style={styles.sectionTitle}>アカウント</Text>
        <View style={styles.optionList}>
          <View style={styles.option}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
            <View style={styles.optionBody}>
              <Text style={styles.optionLabel}>{user?.displayName ?? 'ゲスト'}</Text>
              <Text style={styles.optionDescription}>ログイン中</Text>
            </View>
          </View>
          <Pressable style={styles.option} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={Brand.danger} />
            <View style={styles.optionBody}>
              <Text style={[styles.optionLabel, { color: Brand.danger }]}>ログアウト</Text>
            </View>
          </Pressable>
        </View>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    backButton: {
      width: 32,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.two,
      paddingBottom: Spacing.six,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
      marginTop: Spacing.two,
    },
    optionList: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.background,
    },
    optionSelected: {
      backgroundColor: c.primarySoft,
    },
    optionBody: {
      flex: 1,
      gap: 1,
    },
    optionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    optionDescription: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
