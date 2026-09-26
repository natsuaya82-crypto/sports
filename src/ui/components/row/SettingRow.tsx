import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  /** ラベルの下の補足 */
  description?: string;
  /** 補足の行数上限(既定は折り返しあり) */
  descriptionLines?: number;
  iconSize?: number;
  iconColor?: string;
  labelColor?: string;
  /** 選択中の背景 */
  selected?: boolean;
  /** 右端(シェブロン・ラジオなど) */
  trailing?: ReactNode;
  /** 省くと押せない行になる */
  onPress?: () => void;
}

/** 設定・管理の1行(アイコン + ラベル + 補足 + 右端) */
export function SettingRow({
  icon,
  label,
  description,
  descriptionLines,
  iconSize = 20,
  iconColor,
  labelColor,
  selected,
  trailing,
  onPress,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const rowStyle = [styles.row, selected && styles.rowSelected];

  const body = (
    <>
      <Ionicons name={icon} size={iconSize} color={iconColor ?? colors.text} />
      <View style={styles.body}>
        <Text style={[styles.label, labelColor != null && { color: labelColor }]}>{label}</Text>
        {description != null && (
          <Text style={styles.description} numberOfLines={descriptionLines}>
            {description}
          </Text>
        )}
      </View>
      {trailing}
    </>
  );

  if (!onPress) return <View style={rowStyle}>{body}</View>;
  return (
    <Pressable style={rowStyle} onPress={onPress}>
      {body}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      backgroundColor: c.background,
    },
    rowSelected: {
      backgroundColor: c.primarySoft,
    },
    body: {
      flex: 1,
      gap: 1,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    description: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
