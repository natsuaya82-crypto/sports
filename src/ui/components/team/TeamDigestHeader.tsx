import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** TOPのダイジェスト見出し(もっと見る付き) */
export function TeamDigestHeader({
  en,
  jp,
  color,
  onMore,
}: {
  en: string;
  jp: string;
  color: string;
  onMore: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.digestHeader}>
      <View style={[styles.sectionBar, { backgroundColor: color }]} />
      <View style={styles.digestTitles}>
        <Text style={[styles.sectionEn, { color }]}>{en}</Text>
        <Text style={styles.sectionJp}>{jp}</Text>
      </View>
      <Pressable onPress={onMore} hitSlop={8} style={styles.moreLink}>
        <Text style={[styles.moreText, { color }]}>もっと見る</Text>
        <Ionicons name="chevron-forward" size={12} color={color} />
      </Pressable>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    digestHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginTop: Spacing.three,
    },
    sectionBar: {
      width: 4,
      height: 28,
      borderRadius: 2,
    },
    digestTitles: {
      flex: 1,
    },
    sectionEn: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2,
    },
    sectionJp: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
    },
    moreLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 1,
    },
    moreText: {
      fontSize: 11,
      fontWeight: '700',
    },
  });
