import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** ページ見出し */
export function TeamPageTitle({
  en,
  jp,
  color,
}: {
  en: string;
  jp: string;
  color: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.pageTitle}>
      <Text style={[styles.pageTitleEn, { color }]}>{en}</Text>
      <Text style={styles.pageTitleJp}>{jp}</Text>
      <View style={[styles.pageTitleRule, { backgroundColor: color }]} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    pageTitle: {
      marginTop: Spacing.three,
      gap: 2,
    },
    pageTitleEn: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2,
    },
    pageTitleJp: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    pageTitleRule: {
      width: 32,
      height: 3,
      borderRadius: 2,
      marginTop: 4,
    },
  });
