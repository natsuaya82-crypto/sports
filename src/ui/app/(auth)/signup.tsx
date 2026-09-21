import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { AccountKind, useAuth } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>新規登録</Text>
        <View style={styles.headerSide} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
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

          <Field label={kind === 'team' ? 'あなたの名前(代表者)' : 'ニックネーム'}>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="例: たなか なつ"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </Field>
          <Field label="メールアドレス">
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </Field>
          <Field label="パスワード(4文字以上)">
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="パスワード"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </Field>

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            onPress={submit}
            disabled={busy || !canSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              (busy || !canSubmit) && styles.disabled,
              pressed && styles.pressed,
            ]}>
            <Text style={styles.primaryText}>登録して始める</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>すでに登録済み?</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.footerLink}>ログイン</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    flex: {
      flex: 1,
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
    content: {
      padding: Spacing.four,
      gap: Spacing.two,
    },
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
    field: {
      gap: 5,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: 13,
      fontSize: 14,
      color: c.text,
    },
    error: {
      fontSize: 12,
      fontWeight: '600',
      color: Brand.danger,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: Brand.primary,
      borderRadius: 999,
      paddingVertical: 14,
      marginTop: Spacing.two,
    },
    disabled: {
      opacity: 0.4,
    },
    pressed: {
      opacity: 0.85,
    },
    primaryText: {
      fontSize: 15,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: Spacing.three,
    },
    footerText: {
      fontSize: 13,
      color: c.textSecondary,
    },
    footerLink: {
      fontSize: 13,
      fontWeight: '800',
      color: Brand.primary,
    },
  });
