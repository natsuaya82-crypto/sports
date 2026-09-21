import { FlatList, StyleSheet, View } from 'react-native';

import { ListEmptyState } from '@/ui/components/opportunity/ListEmptyState';
import { OpportunityCard } from '@/ui/components/search/OpportunityCard';
import { Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { toggleFavorite } from '@/data/favorite-store';
import type { Opportunity } from '@/domain/opportunity';

const GRID_COLUMNS = 2;

/** 最終行が欠けてもカード幅が変わらないよう埋める透明スペーサー */
type Spacer = { id: string; spacer: true };
type GridItem = Opportunity | Spacer;

function isSpacer(item: GridItem): item is Spacer {
  return 'spacer' in item;
}

function padToColumns(items: readonly Opportunity[]): GridItem[] {
  const rest = items.length % GRID_COLUMNS;
  if (rest === 0) return [...items];
  return [
    ...items,
    ...Array.from(
      { length: GRID_COLUMNS - rest },
      (_, i): Spacer => ({ id: `spacer-${i}`, spacer: true }),
    ),
  ];
}

interface Props {
  items: readonly Opportunity[];
  favorites: ReadonlySet<string>;
  onPressItem: (item: Opportunity) => void;
  emptyTitle: string;
  emptyHint: string;
  /** リスト側だけを伸縮させ、日付ストリップなど上の要素を潰さない */
  fillHeight?: boolean;
}

/** 募集カードの2列グリッド。さがす画面とおきにいり画面で共用する */
export function OpportunityGrid({
  items,
  favorites,
  onPressItem,
  emptyTitle,
  emptyHint,
  fillHeight = false,
}: Props) {
  const styles = useThemedStyles(makeStyles);

  const renderItem = ({ item }: { item: GridItem }) => {
    if (isSpacer(item)) return <View style={styles.cardSpacer} />;
    return (
      <OpportunityCard
        item={item}
        isFavorite={favorites.has(item.id)}
        onToggleFavorite={toggleFavorite}
        onPress={onPressItem}
      />
    );
  };

  return (
    <FlatList
      key={`grid-${GRID_COLUMNS}`}
      style={fillHeight ? styles.list : undefined}
      data={padToColumns(items)}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={GRID_COLUMNS}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<ListEmptyState title={emptyTitle} hint={emptyHint} />}
    />
  );
}

const makeStyles = (_c: Palette) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    column: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    // 最終行の欠けを埋めるダミー(カードと同じ幅を占有)
    cardSpacer: {
      flex: 1,
    },
    listContent: {
      gap: Spacing.two,
      paddingBottom: 88,
    },
  });
