import { Pressable, Text } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeAuthStyles } from './auth-form';

interface Props {
  label: string;
  /** 入力の下・ボタンの上に出す失敗理由 */
  error?: string | null;
  disabled?: boolean;
  onPress: () => void;
}

/** 認証画面のエラー表示と送信ボタン */
export function AuthSubmit({ label, error, disabled, onPress }: Props) {
  const styles = useThemedStyles(makeAuthStyles);

  return (
    <>
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.primaryButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}>
        <Text style={styles.primaryText}>{label}</Text>
      </Pressable>
    </>
  );
}
