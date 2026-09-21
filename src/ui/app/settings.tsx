import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RowGroup } from '@/ui/components/row/RowGroup';
import { ScreenHeader } from '@/ui/components/row/ScreenHeader';
import { SettingRow } from '@/ui/components/row/SettingRow';
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
      <ScreenHeader title="アカウント設定" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* テーマ */}
        <Text style={styles.sectionTitle}>テーマ</Text>
        <RowGroup>
          {THEME_OPTIONS.map((opt) => {
            const selected = mode === opt.key;
            return (
              <SettingRow
                key={opt.key}
                icon={opt.icon}
                iconColor={selected ? Brand.primary : colors.textSecondary}
                label={opt.label}
                description={opt.description}
                selected={selected}
                trailing={
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? Brand.primary : colors.textSecondary}
                  />
                }
                onPress={() => setMode(opt.key)}
              />
            );
          })}
        </RowGroup>

        {/* 今後の設定項目の置き場 */}
        <Text style={styles.sectionTitle}>アカウント</Text>
        <RowGroup>
          <SettingRow
            icon="person-outline"
            iconColor={colors.textSecondary}
            label={user?.displayName ?? 'ゲスト'}
            description="ログイン中"
          />
          <SettingRow
            icon="log-out-outline"
            iconColor={Brand.danger}
            label="ログアウト"
            labelColor={Brand.danger}
            onPress={logout}
          />
        </RowGroup>
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
  });
