import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField } from '@/ui/components/auth/AuthField';
import { AuthFooterLink } from '@/ui/components/auth/AuthFooterLink';
import { AuthFormLayout } from '@/ui/components/auth/AuthFormLayout';
import { AuthSubmit } from '@/ui/components/auth/AuthSubmit';
import { ScreenHeader } from '@/ui/components/row/ScreenHeader';
import { AccountKind, useAuth } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand, Palette, Spacing } from '@/ui/theme';

const KIND_OPTIONS: {
  key: AccountKind;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    key: 'personal',
    label: '個人で使う',
    desc: '参加先を探す・スカウトを受ける',
    icon: 'person-outline',
  },
  {
    key: 'team',
    label: 'チームで使う',
    desc: '公式サイトを作る・メンバーを集める',
    icon: 'shield-outline',
  },
];

export default function SignupScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { signup } = useAuth();

  const [kind, setKind] = useState<AccountKind>('personal');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSubmit = name.trim() !== '' && email.trim() !== '' && password.length >= 4;

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setError(null);
    const res = await signup({ name, email, password, kind });
    setBusy(false);
    if (!res.ok) setError(res.error ?? '登録に失敗しました');
    // 成功時はガードが自動でホームへ遷移する
  };

  return (
    <AuthFormLayout header={<ScreenHeader title="新規登録" onBack={() => router.back()} />}>
      {/* 個人 / 団体 */}
      <Text style={styles.sectionTitle}>どう使う?</Text>
      <View style={styles.kindRow}>
        {KIND_OPTIONS.map((o) => {
          const selected = kind === o.key;
          return (
            <Pressable
              key={o.key}
              onPress={() => setKind(o.key)}
              style={[styles.kindCard, selected && styles.kindCardSelected]}>
              <Ionicons
                name={o.icon}
                size={22}
                color={selected ? Brand.primary : colors.textSecondary}
              />
              <Text style={[styles.kindLabel, selected && styles.kindLabelSelected]}>
                {o.label}
              </Text>
              <Text style={styles.kindDesc}>{o.desc}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.hint}>
        あとから切り替えできます。チームは登録後いつでも作れます
      </Text>

      <AuthField
        label={kind === 'team' ? 'あなたの名前(代表者)' : 'ニックネーム'}
        value={name}
        onChangeText={setName}
        placeholder="例: たなか なつ"
      />
      <AuthField
        label="メールアドレス"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        kind="email"
      />
      <AuthField
        label="パスワード(4文字以上)"
        value={password}
        onChangeText={setPassword}
        placeholder="パスワード"
        kind="password"
      />

      <AuthSubmit
        label="登録して始める"
        error={error}
        disabled={busy || !canSubmit}
        onPress={submit}
      />

      <AuthFooterLink text="すでに登録済み?" link="ログイン" onPress={() => router.back()} />
    </AuthFormLayout>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    kindRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    kindCard: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.three,
      gap: 4,
    },
    kindCardSelected: {
      borderColor: Brand.primary,
      backgroundColor: c.primarySoft,
    },
    kindLabel: {
      fontSize: 13,
      fontWeight: '800',
      color: c.text,
    },
    kindLabelSelected: {
      color: Brand.primary,
    },
    kindDesc: {
      fontSize: 10,
      lineHeight: 15,
      color: c.textSecondary,
    },
    hint: {
      fontSize: 11,
      color: c.textSecondary,
      marginBottom: Spacing.two,
    },
  });
