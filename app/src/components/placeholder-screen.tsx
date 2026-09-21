import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/theme-context';

interface Props {
  title: string;
  description: string;
}

/** 未実装タブの仮画面 */
export function PlaceholderScreen({ title, description }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: c.background,
      paddingHorizontal: Spacing.four,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    description: {
      fontSize: 13,
      color: c.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
