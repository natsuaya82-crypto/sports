import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand, Palette, Spacing } from '@/ui/theme';

/** チーム管理メニューの1行 */
export function TeamManageRow({
  icon,
  label,
  note,
  badge,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  note?: string;
  badge?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable style={[styles.menuItem, last && styles.menuItemLast]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.text} />
      <Text style={styles.menuLabel}>{label}</Text>
      {note && <Text style={styles.menuNote}>{note}</Text>}
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    menuItemLast: {
      borderBottomWidth: 0,
    },
    menuLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
    menuNote: {
      fontSize: 11,
      color: c.textSecondary,
    },
    badge: {
      backgroundColor: Brand.danger,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    badgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#ffffff',
    },
  });
