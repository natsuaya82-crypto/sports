import { Text, TextInput, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

import { makeAuthStyles } from './auth-form';

/** 入力の種類。キーボードと伏せ字の出し分けだけを表す */
export type AuthFieldKind = 'text' | 'email' | 'password';

interface Props {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  kind?: AuthFieldKind;
  onSubmitEditing?: () => void;
}

/** 認証画面の入力欄(ラベル + 入力) */
export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  kind = 'text',
  onSubmitEditing,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeAuthStyles);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={kind === 'email' ? 'none' : undefined}
        keyboardType={kind === 'email' ? 'email-address' : undefined}
        secureTextEntry={kind === 'password'}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}
