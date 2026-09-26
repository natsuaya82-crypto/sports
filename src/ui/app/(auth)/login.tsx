import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthField } from '@/ui/components/auth/AuthField';
import { AuthFooterLink } from '@/ui/components/auth/AuthFooterLink';
import { AuthFormLayout } from '@/ui/components/auth/AuthFormLayout';
import { AuthSubmit } from '@/ui/components/auth/AuthSubmit';
import { useAuth } from '@/ui/contexts/auth-context';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand, Palette, Spacing } from '@/ui/theme';

export default function LoginScreen() {
  const router = useRouter();
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
    <AuthFormLayout centered>
      {/* ロゴ */}
      <View style={styles.brandMark}>
        <Ionicons name="football" size={30} color={Brand.onPrimary} />
      </View>
      <Text style={styles.brandName}>スポマチ</Text>
      <Text style={styles.brandTagline}>チームと選手が、見つけ合う。</Text>

      <View style={styles.form}>
        <AuthField
          label="メールアドレス"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          kind="email"
        />
        <AuthField
          label="パスワード"
          value={password}
          onChangeText={setPassword}
          placeholder="パスワード"
          kind="password"
          onSubmitEditing={() => submit()}
        />

        <AuthSubmit
          label="ログイン"
          error={error}
          disabled={busy || !email.trim() || !password}
          onPress={() => submit()}
        />

        <Pressable onPress={loginAsDemo} style={styles.demoButton}>
          <Ionicons name="flash-outline" size={15} color={Brand.primary} />
          <Text style={styles.demoText}>デモアカウントで入る</Text>
        </Pressable>
      </View>

      <AuthFooterLink
        text="アカウントがない?"
        link="新規登録"
        onPress={() => router.push('/signup')}
      />
    </AuthFormLayout>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
  });
