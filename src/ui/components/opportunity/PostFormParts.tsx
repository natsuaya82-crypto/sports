import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

/** 選択チップ。選択中だけ色が塗られる */
export function Chip({
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
  const styles = usePostStyles();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? Brand.primary }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

/** カード型のセクション(アイコン+見出し) */
export function Card({
  icon,
  title,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  children: ReactNode;
}) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={15} color={colors.text} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

/** カード内の小見出し */
export function FieldLabel({ text }: { text: string }) {
  const styles = usePostStyles();
  return <Text style={styles.fieldLabel}>{text}</Text>;
}

/** 「ラベル ・・・ 現在値 >」の選択行(タップでシートが開く) */
export function SelectorRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.selectorRow, pressed && styles.selectorPressed]}>
      <Text style={styles.selectorLabel}>{label}</Text>
      <Text style={styles.selectorValue}>{value}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

/** 募集作成フォームの見た目。カードを分割しても同じ値を使うため1箇所に置く */
export function usePostStyles() {
  return useThemedStyles(makeStyles);
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.three,
      gap: Spacing.two,
      backgroundColor: c.background,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.half,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
      marginTop: Spacing.one,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
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
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
      fontSize: 13,
      color: c.text,
    },
    inputMultiline: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    hint: {
      fontSize: 11,
      color: c.textSecondary,
    },
    venueField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
    },
    venuePressed: {
      opacity: 0.7,
    },
    venueBody: {
      flex: 1,
      gap: 1,
    },
    venueName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
    venueWard: {
      fontSize: 11,
      color: c.textSecondary,
    },
    venuePlaceholder: {
      flex: 1,
      fontSize: 13,
      color: c.textSecondary,
    },
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 11,
    },
    selectorPressed: {
      opacity: 0.7,
    },
    selectorLabel: {
      flex: 1,
      fontSize: 12,
      color: c.textSecondary,
    },
    selectorValue: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    stepperRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
    },
    stepperButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    stepperValue: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      minWidth: 44,
      textAlign: 'center',
    },
  });
