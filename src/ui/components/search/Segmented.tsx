import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Palette } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props<T extends string> {
  options: readonly { key: T; label: string }[];
  selected: T;
  onSelect: (key: T) => void;
}

/** 単一選択のセグメント */
export function Segmented<T extends string>({ options, selected, onSelect }: Props<T>) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const isSelected = o.key === selected;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            style={[styles.segment, isSelected && styles.segmentSelected]}>
            <Text
              style={[styles.segmentText, isSelected && styles.segmentTextSelected]}
              numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      padding: 3,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 8,
    },
    segmentSelected: {
      backgroundColor: Brand.primary,
    },
    segmentText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.text,
    },
    segmentTextSelected: {
      color: Brand.onPrimary,
      fontWeight: '700',
    },
  });
