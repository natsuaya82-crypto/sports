import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { Screen } from '@/ui/components/Screen';
import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeAuthStyles } from './auth-form';

interface Props {
  /** ヘッダーを持つ画面だけ渡す(スクロール領域の外に出す) */
  header?: ReactNode;
  /** 内容を画面中央に置く(ログイン画面) */
  centered?: boolean;
  children: ReactNode;
}

/** 認証画面の枠(キーボード回避つきのスクロール領域) */
export function AuthFormLayout({ header, centered, children }: Props) {
  const styles = useThemedStyles(makeAuthStyles);

  return (
    <Screen edges={['top', 'bottom']}>
      {header}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.content, centered && styles.contentCentered]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
