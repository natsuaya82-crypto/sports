import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  area: string;
  onPress?: () => void;
}

/** エリア選択ボタン(ヘッダー3ボタンの1つ。余白は親が管理する) */
export function AreaHeader({ area, onPress }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.bar, pressed && styles.pressed]}>
      <Ionicons name="location-sharp" size={15} color={colors.text} />
      <Text style={styles.label} numberOfLines={1}>
        {area}
      </Text>
      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 12,
    },
    pressed: {
      opacity: 0.7,
    },
    label: {
      flexShrink: 1,
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
  });
