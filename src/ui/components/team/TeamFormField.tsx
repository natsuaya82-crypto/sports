import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeEditFieldStyles } from './edit-form';

/** ラベル付きの入力欄 */
export function TeamFormField({
  label,
  hint,
  style,
  children,
}: {
  label: string;
  hint?: string;
  style?: object;
  children: ReactNode;
}) {
  const styles = useThemedStyles(makeEditFieldStyles);
  return (
    <View style={[styles.field, style]}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
      {children}
    </View>
  );
}
