import { Pressable, Text } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand } from '@/ui/theme';

import { makeEditFieldStyles } from './edit-form';

/** 選択チップ */
export function TeamFormChip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const styles = useThemedStyles(makeEditFieldStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? Brand.primary }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}
