import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import type { Badge } from '@/domain/badge';

interface BadgeListProps {
  badges: readonly Badge[];
  /** 余白は置かれる場所ごとに違うのでpropsで渡す */
  style?: StyleProp<ViewStyle>;
  /** 文字の大きさは置かれる場所ごとに違うのでpropsで渡す */
  textStyle?: StyleProp<TextStyle>;
}

/**
 * 到達型バッジ（docs/DOMAIN.md 9.5）を既存のタグの見た目で並べる。
 * 置き場所の行にそのまま並ぶよう、外枠は持たない。1件も無ければ何も描画しない。
 */
export function BadgeList({ badges, style, textStyle }: BadgeListProps) {
  const styles = useThemedStyles(makeStyles);
  if (badges.length === 0) return null;
  return (
    <>
      {badges.map((badge) => (
        <View key={badge.key} style={[styles.badge, style]}>
          <Text style={[styles.text, textStyle]}>{badge.label}</Text>
        </View>
      ))}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    badge: {
      backgroundColor: c.tagBackground,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    text: {
      fontSize: 10,
      fontWeight: '600',
      color: c.tagText,
    },
  });
