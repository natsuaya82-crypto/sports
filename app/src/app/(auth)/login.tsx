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

import { Brand, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { useAuth } from '@/contexts/auth-context';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { login, demoEmail, demoPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e = email, p = password) => {
    setBusy(true);
    setError(null);
    const res = await login(e, p);
    setBusy(false);
    if (!res.ok) setError(res.error ?? 'ログインに失敗しました');
    // 成功時はガードが自動でホームへ遷移する
  };

  const loginAsDemo = () => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    submit(demoEmail, demoPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* ロゴ */}
          <View style={styles.brandMark}>
            <Ionicons name="football" size={30} color={Brand.onPrimary} />
          </View>
          <Text style={styles.brandName}>スポマチ</Text>
          <Text style={styles.brandTagline}>チームと選手が、見つけ合う。</Text>

          <View style={styles.form}>
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
            <Field label="パスワード">
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="パスワード"
                placeholderTextColor={colors.textSecondary}
                style={styles.input}
                onSubmitEditing={() => submit()}
              />
            </Field>

            {error && <Text style={styles.error}>{error}</Text>}

            <Pressable
              onPress={() => submit()}
              disabled={busy || !email.trim() || !password}
              style={({ pressed }) => [
                styles.primaryButton,
                (busy || !email.trim() || !password) && styles.disabled,
                pressed && styles.pressed,
              ]}>
              <Text style={styles.primaryText}>ログイン</Text>
            </Pressable>

            <Pressable onPress={loginAsDemo} style={styles.demoButton}>
              <Ionicons name="flash-outline" size={15} color={Brand.primary} />
              <Text style={styles.demoText}>デモアカウントで入る</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>アカウントがない?</Text>
            <Pressable onPress={() => router.push('/signup')}>
              <Text style={styles.footerLink}>新規登録</Text>
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
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      padding: Spacing.four,
      gap: Spacing.two,
    },
    brandMark: {
      alignSelf: 'center',
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: Brand.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandName: {
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '900',
      color: c.text,
      marginTop: Spacing.two,
    },
    brandTagline: {
      textAlign: 'center',
      fontSize: 13,
      color: c.textSecondary,
      marginBottom: Spacing.three,
    },
    form: {
      gap: Spacing.two,
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
    demoButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
    },
    demoText: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.primary,
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
