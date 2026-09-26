import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
  useRouter,
  useSegments,
} from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Brand, MaxPhoneWidth, Palette } from '@/ui/theme';
import { AuthProvider, useAuth } from '@/ui/contexts/auth-context';
import {
  AppThemeProvider,
  useAppTheme,
  useThemedStyles,
} from '@/ui/contexts/theme-context';

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <ThemedApp />
      </AuthProvider>
    </AppThemeProvider>
  );
}

/** 未ログインは(auth)へ、ログイン済みが(auth)にいたらホームへ振り分ける */
function useAuthGate() {
  const { ready, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [ready, user, segments, router]);
}

function ThemedApp() {
  const { scheme } = useAppTheme();
  const { ready } = useAuth();
  const styles = useThemedStyles(makeStyles);
  useAuthGate();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.outer}>
        <View style={styles.phoneFrame}>
          {ready ? (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="settings" />
            </Stack>
          ) : (
            <View style={styles.splash}>
              <ActivityIndicator color={Brand.primary} />
            </View>
          )}
        </View>
      </View>
    </ThemeProvider>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: c.outerBackground,
    },
    phoneFrame: {
      flex: 1,
      width: '100%',
      maxWidth: MaxPhoneWidth,
      backgroundColor: c.background,
      borderLeftWidth: StyleSheet.hairlineWidth,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    splash: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
