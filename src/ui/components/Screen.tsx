import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import type { Edge } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette } from '@/ui/theme';

interface ScreenProps {
  /** 端末のノッチ等を避ける辺。画面ごとに違うのでpropsで渡す */
  edges?: readonly Edge[];
  children: ReactNode;
}

/** 画面の外枠。背景色と安全領域だけを持ち、中身は画面ごとに渡す */
export function Screen({ edges = ['top'], children }: ScreenProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
  });
