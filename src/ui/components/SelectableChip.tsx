import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand, Palette } from '@/ui/theme';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 選択中の塗り色。省略時はブランド色 */
  color?: string;
  /** 余白は画面ごとに違うのでpropsで渡す */
  style?: StyleProp<ViewStyle>;
  /** 選択中の文字。太さが画面ごとに違うのでpropsで渡す */
  selectedTextStyle?: StyleProp<TextStyle>;
}

/** 押すたびに選択が切り替わる丸いチップ */
export function SelectableChip({
  label,
  selected,
  onPress,
  color,
  style,
  selectedTextStyle,
}: SelectableChipProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, style, selected && { backgroundColor: color ?? Brand.primary }]}>
      <Text
        style={[
          styles.chipText,
          selected && styles.chipTextSelected,
          selected === true && selectedTextStyle,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
    },
  });
