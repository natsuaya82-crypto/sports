import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette } from '@/ui/theme';

/** 設定・管理の行をまとめる枠 */
export function RowGroup({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.group}>{children}</View>;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    group: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      overflow: 'hidden',
    },
  });
