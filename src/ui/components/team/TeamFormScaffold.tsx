import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeEditFormStyles } from './edit-form';

/** フォーム共通の骨格(スクロール+保存バー) */
export function TeamFormScaffold({
  children,
  canSave,
  color,
  onSave,
}: {
  children: ReactNode;
  canSave: boolean;
  color: string;
  onSave: () => void;
}) {
  const styles = useThemedStyles(makeEditFormStyles);
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={styles.saveBar}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: color },
            !canSave && styles.saveButtonDisabled,
            pressed && styles.savePressed,
          ]}>
          <Text style={styles.saveText}>保存する</Text>
        </Pressable>
      </View>
    </>
  );
}
