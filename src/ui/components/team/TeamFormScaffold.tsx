import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text } from 'react-native';

import { BottomBar } from '@/ui/components/BottomBar';
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
      <BottomBar>
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
      </BottomBar>
    </>
  );
}
