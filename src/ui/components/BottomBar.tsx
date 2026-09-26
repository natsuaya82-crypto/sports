import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** 画面下部に固定する操作バー。中身(保存・応募などのボタン)は画面ごとに渡す */
export function BottomBar({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.bar}>{children}</View>;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      backgroundColor: c.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
  });
