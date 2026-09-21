import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  onReset: () => void;
  /** 適用ボタンの文言（件数やエリア名を含むため画面ごとに異なる） */
  applyLabel: string;
  onApply: () => void;
}

/** 条件を編集するシートのフッター（リセット + 適用） */
export function SheetFooterActions({ onReset, applyLabel, onApply }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.footer}>
      <Pressable
        onPress={onReset}
        style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
        <Text style={styles.resetText}>リセット</Text>
      </Pressable>
      <Pressable
        onPress={onApply}
        style={({ pressed }) => [styles.applyButton, pressed && styles.applyPressed]}>
        <Text style={styles.applyText}>{applyLabel}</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.four,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    resetButton: {
      paddingHorizontal: Spacing.three,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: c.backgroundElement,
    },
    pressed: {
      opacity: 0.7,
    },
    resetText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    applyButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: Brand.primary,
    },
    applyPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    applyText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
  });
