import { StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  title: string;
  hint: string;
}

/** 一覧が空のときの見出しと補足。さがす画面とおきにいり画面で共用する */
export function ListEmptyState({ title, hint }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyHint}>{hint}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    empty: {
      alignItems: 'center',
      paddingTop: 80,
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    emptyHint: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
