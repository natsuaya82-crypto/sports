import type { StyleProp, TextStyle } from 'react-native';
import { StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette } from '@/ui/theme';

/** タブ画面の見出し。余白は画面ごとに違うのでpropsで渡す */
export function ScreenTitle({
  title,
  style,
}: {
  title: string;
  style?: StyleProp<TextStyle>;
}) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[styles.title, style]}>{title}</Text>;
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    title: { fontSize: 18, fontWeight: '800', color: c.text },
  });
