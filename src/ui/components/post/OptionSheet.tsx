import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { BottomSheet } from '@/ui/components/sheet/BottomSheet';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

export interface SheetOption<T extends string | number> {
  label: string;
  value: T;
}

interface Props<T extends string | number> {
  visible: boolean;
  title: string;
  options: SheetOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** 選択肢リストのボトムシート(選ぶと閉じる) */
export function OptionSheet<T extends string | number>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: Props<T>) {
  const styles = useThemedStyles(makeStyles);

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose} maxHeight="60%">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {options.map((o) => {
          const isSelected = o.value === selected;
          return (
            <Pressable
              key={String(o.value)}
              onPress={() => {
                onSelect(o.value);
                onClose();
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
              <Text style={[styles.rowLabel, isSelected && styles.rowLabelSelected]}>
                {o.label}
              </Text>
              {isSelected && <Ionicons name="checkmark" size={18} color={Brand.primary} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowPressed: {
      opacity: 0.6,
    },
    rowLabel: {
      fontSize: 14,
      color: c.text,
    },
    rowLabelSelected: {
      fontWeight: '800',
      color: Brand.primary,
    },
  });
