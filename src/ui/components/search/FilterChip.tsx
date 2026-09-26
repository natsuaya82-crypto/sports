import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

/** チップを折り返しながら並べる行 */
export function FilterChipRow({ children }: { children: ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return <View style={styles.chipRow}>{children}</View>;
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** 選択中の背景色。既定はブランド色 */
  selectedColor?: string;
  /** 左に置くアイコン。指定した場合だけラベルの横に並べる */
  icon?: keyof typeof Ionicons.glyphMap;
}

/** 絞りこみシートの選択チップ */
export function FilterChip({ label, selected, onPress, selectedColor, icon }: ChipProps) {
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        icon != null && styles.iconChip,
        selected && { backgroundColor: selectedColor ?? Brand.primary },
      ]}>
      {icon != null && (
        <Ionicons
          name={icon}
          size={14}
          color={selected ? Brand.onPrimary : styles.chipText.color}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 15,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    iconChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
      fontWeight: '700',
    },
  });
