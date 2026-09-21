import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

interface ListRowProps {
  /** 渡された場合だけ行を押せるようにする */
  onPress?: () => void;
  children: ReactNode;
}

/** 一覧の1行を囲む枠。中身(アイコン・本文・右端の補足)は画面ごとに渡す */
export function ListRow({ onPress, children }: ListRowProps) {
  const styles = useThemedStyles(makeStyles);
  if (onPress === undefined) return <View style={styles.row}>{children}</View>;
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {children}
    </Pressable>
  );
}

/** 一覧の1行の本文(残り幅いっぱいの縦積み)。行間は画面ごとに違うのでpropsで渡す */
export function ListRowBody({ gap, children }: { gap: number; children: ReactNode }) {
  return <View style={[styles.body, { gap }]}>{children}</View>;
}

const styles = StyleSheet.create({
  body: { flex: 1 },
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
  });
