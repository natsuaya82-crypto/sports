import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

interface Props {
  title: string;
  onBack: () => void;
}

/** 画面上部の行(戻る + タイトル)。タイトルを中央に保つため右側は同じ幅の余白を置く */
export function ScreenHeader({ title, onBack }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.side}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.side} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    side: {
      width: 32,
      alignItems: 'flex-start',
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
  });
