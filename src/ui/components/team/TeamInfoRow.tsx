import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** チーム情報の1行 */
export function TeamInfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    infoLabel: {
      width: 64,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
  });
