import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

interface InfoCardProps {
  /** 行間。画面ごとに違うのでpropsで渡す */
  gap: number;
  /** 直前の要素との間隔 */
  marginTop?: number;
  children: ReactNode;
}

/** 「アイコン + ラベル + 値」の行をまとめる枠 */
export function InfoCard({ gap, marginTop = 0, children }: InfoCardProps) {
  const styles = useThemedStyles(makeStyles);
  return <View style={[styles.card, { gap, marginTop }]}>{children}</View>;
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  /** ラベル列の幅。ラベルの文字数が画面ごとに違うのでpropsで渡す */
  labelWidth: number;
  /** 値が複数行になる画面では上揃えにして行間を広げる */
  multiline?: boolean;
}

/** 「アイコン + ラベル + 値」の1行 */
export function InfoRow({ icon, label, value, labelWidth, multiline }: InfoRowProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={[styles.row, multiline === true && styles.rowMultiline]}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={[styles.label, { width: labelWidth }]}>{label}</Text>
      <Text style={[styles.value, multiline === true && styles.valueMultiline]}>
        {value}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
    rowMultiline: { alignItems: 'flex-start' },
    label: { fontSize: 12, fontWeight: '600', color: c.textSecondary },
    value: { flex: 1, fontSize: 12, fontWeight: '600', color: c.text },
    valueMultiline: { lineHeight: 18 },
  });
