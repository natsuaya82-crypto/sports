import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { StyleSheet, Text, View } from 'react-native';

import { FlameIcon } from '@/ui/components/Icons';
import { getLevelLabel, type Level } from '@/domain/level';
import { LevelColors } from '@/ui/theme';

interface LevelBadgeProps {
  level: Level;
  /** 炎アイコンの大きさ。置かれる場所ごとに違うのでpropsで渡す */
  iconSize: number;
  /** 余白は置かれる場所ごとに違うのでpropsで渡す */
  style?: StyleProp<ViewStyle>;
  /** 文字の大きさは置かれる場所ごとに違うのでpropsで渡す */
  textStyle?: StyleProp<TextStyle>;
}

/** レベル感を色つきの枠で示すバッジ。本気度が高いときだけ炎を添える */
export function LevelBadge({ level, iconSize, style, textStyle }: LevelBadgeProps) {
  return (
    <View style={[styles.badge, style, { borderColor: LevelColors[level] }]}>
      {level === 'serious' && <FlameIcon size={iconSize} color={LevelColors[level]} />}
      <Text style={[styles.text, textStyle, { color: LevelColors[level] }]}>
        {getLevelLabel(level)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderWidth: 1,
    borderRadius: 999,
  },
  text: {
    fontWeight: '700',
  },
});
