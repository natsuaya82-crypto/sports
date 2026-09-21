import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  onPress?: () => void;
  /** false にすると浮かせず、通常のレイアウトフロー内に置く(黒文字・淡色背景) */
  floating?: boolean;
  /** 適用中の条件数。1以上でバッジ表示 */
  activeCount?: number;
}

/** 「絞りこみ」ボタン(floating: 画面下部中央に浮かぶ / インライン配置) */
export function FilterFab({ onPress, floating = true, activeCount = 0 }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const textColor = floating ? Brand.onPrimary : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        floating ? styles.floating : styles.inline,
        pressed && (floating ? styles.pressedFloating : styles.pressedInline),
      ]}>
      <Ionicons name="options-outline" size={18} color={textColor} />
      <Text style={[styles.label, { color: textColor }]}>絞りこみ</Text>
      {activeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{activeCount}</Text>
        </View>
      )}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    floating: {
      position: 'absolute',
      bottom: 16,
      alignSelf: 'center',
      backgroundColor: Brand.primary,
      shadowColor: '#000',
      shadowOpacity: 0.2,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 5,
    },
    inline: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 12,
    },
    pressedFloating: {
      backgroundColor: Brand.primaryPressed,
    },
    pressedInline: {
      opacity: 0.7,
    },
    label: {
      fontSize: 14,
      fontWeight: '800',
    },
    badge: {
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Brand.primary,
    },
    badgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
  });
