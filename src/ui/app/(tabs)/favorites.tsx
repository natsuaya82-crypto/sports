import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OpportunityGrid } from '@/ui/components/opportunity/OpportunityGrid';
import { Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useFavorites } from '@/ui/hooks/use-favorites';
import { useOpportunities } from '@/ui/hooks/use-opportunities';

/** おきにいりタブ: ハートを付けた募集の一覧 */
export default function FavoritesScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const favorites = useFavorites();
  const opportunities = useOpportunities();

  const listData = useMemo(
    () => opportunities.filter((o) => favorites.has(o.id)),
    [opportunities, favorites],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.screenTitle}>おきにいり</Text>
      <OpportunityGrid
        items={listData}
        favorites={favorites}
        onPressItem={(o) =>
          router.push({ pathname: '/opportunity/[id]', params: { id: o.id } })
        }
        emptyTitle="おきにいりはまだありません"
        emptyHint="募集カードのハートを押すと、ここに保存されます"
      />
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.two,
    },
  });
