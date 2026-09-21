import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RecruitmentCard } from '@/components/search/recruitment-card';
import { Palette, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/theme-context';
import { toggleFavorite, useFavorites } from '@/data/favorites-store';
import { useRecruitments } from '@/data/recruitment-store';
import type { Recruitment } from '@/types/recruitment';

const GRID_COLUMNS = 2;

type Spacer = { id: string; spacer: true };
type GridItem = Recruitment | Spacer;

function isSpacer(item: GridItem): item is Spacer {
  return 'spacer' in item;
}

/** おきにいりタブ: ハートを付けた募集の一覧 */
export default function FavoritesScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const favorites = useFavorites();
  const recruitments = useRecruitments();

  const listData = useMemo<GridItem[]>(() => {
    const items = recruitments.filter((r) => favorites.has(r.id));
    if (items.length % GRID_COLUMNS === 0) return items;
    return [...items, { id: 'spacer-0', spacer: true }];
  }, [recruitments, favorites]);

  const renderItem = ({ item }: { item: GridItem }) => {
    if (isSpacer(item)) return <View style={styles.cardSpacer} />;
    return (
      <RecruitmentCard
        item={item}
        isFavorite
        onToggleFavorite={toggleFavorite}
        onPress={(r) =>
          router.push({ pathname: '/recruitment/[id]', params: { id: r.id } })
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.screenTitle}>おきにいり</Text>
      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>おきにいりはまだありません</Text>
            <Text style={styles.emptyHint}>
              募集カードのハートを押すと、ここに保存されます
            </Text>
          </View>
        }
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
    column: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    cardSpacer: {
      flex: 1,
    },
    listContent: {
      gap: Spacing.two,
      paddingBottom: 88,
    },
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
