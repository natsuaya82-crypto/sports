import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { ScreenTitle } from '@/ui/components/list/ScreenTitle';
import { Screen } from '@/ui/components/Screen';
import { OpportunityGrid } from '@/ui/components/opportunity/OpportunityGrid';
import { Spacing } from '@/ui/theme';
import { useFavorites } from '@/ui/hooks/use-favorites';
import { useOpportunities } from '@/ui/hooks/use-opportunities';

/** おきにいりタブ: ハートを付けた募集の一覧 */
export default function FavoritesScreen() {
  const router = useRouter();
  const favorites = useFavorites();
  const opportunities = useOpportunities();

  const listData = useMemo(
    () => opportunities.filter((o) => favorites.has(o.id)),
    [opportunities, favorites],
  );

  return (
    <Screen>
      <ScreenTitle title="おきにいり" style={styles.screenTitle} />
      <OpportunityGrid
        items={listData}
        favorites={favorites}
        onPressItem={(o) =>
          router.push({ pathname: '/opportunity/[id]', params: { id: o.id } })
        }
        emptyTitle="おきにいりはまだありません"
        emptyHint="募集カードのハートを押すと、ここに保存されます"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
});
