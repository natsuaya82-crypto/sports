import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AreaHeader } from '@/ui/components/search/AreaHeader';
import {
  areaLabel,
  AreaSelection,
  AreaSheet,
  DEFAULT_AREA,
  matchesArea,
} from '@/ui/components/search/AreaSheet';
import { DateStrip } from '@/ui/components/search/DateStrip';
import { FilterFab } from '@/ui/components/search/FilterFab';
import {
  applyFilter,
  countActiveFilters,
  DEFAULT_FILTER,
  FilterSheet,
  OpportunityFilter,
} from '@/ui/components/search/FilterSheet';
import { ModeToggle, SearchMode } from '@/ui/components/search/ModeToggle';
import { OpportunityCard } from '@/ui/components/search/OpportunityCard';
import { SportSelectButton, SportSheet } from '@/ui/components/search/SportSelect';
import { TeamCard } from '@/ui/components/search/TeamCard';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { toggleFavorite, useFavorites } from '@/data/favorites-store';
// TODO-PORT unresolved: dateFromToday from @/data/mock-opportunities
import { useOpportunities } from '@/data/opportunity-store';
import { useTeams } from '@/data/team-store';
import type { Opportunity } from '@/domain/opportunity';
import type { Sport } from '@/domain/sport';
import type { Team } from '@/domain/team';

const DAYS_TO_SHOW = 14;
const GRID_COLUMNS = 2;

/** 最終行が欠けてもカード幅が変わらないよう埋める透明スペーサー */
type Spacer = { id: string; spacer: true };
type GridItem = Opportunity | Spacer;

function isSpacer(item: GridItem): item is Spacer {
  return 'spacer' in item;
}

function padToColumns(items: Opportunity[]): GridItem[] {
  const rest = items.length % GRID_COLUMNS;
  if (rest === 0) return items;
  return [
    ...items,
    ...Array.from(
      { length: GRID_COLUMNS - rest },
      (_, i): Spacer => ({ id: `spacer-${i}`, spacer: true }),
    ),
  ];
}

export default function SearchScreen() {
  const styles = useThemedStyles(makeStyles);
  const [mode, setMode] = useState<SearchMode>('date');
  const [area, setArea] = useState(DEFAULT_AREA);
  const [areaOpen, setAreaOpen] = useState(false);
  const [filter, setFilter] = useState(DEFAULT_FILTER);
  const [filterOpen, setFilterOpen] = useState(false);
  // 競技はエリア横のプルダウンで絞る(両モード共通)
  const [sport, setSport] = useState<Sport | null>(null);
  const [sportOpen, setSportOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* エリア+競技プルダウン+絞りこみ(均等3ボタン) */}
      <View style={styles.headerRow}>
        <AreaHeader area={areaLabel(area)} onPress={() => setAreaOpen(true)} />
        <SportSelectButton selected={sport} onPress={() => setSportOpen(true)} />
        <FilterFab
          floating={false}
          activeCount={mode === 'date' ? countActiveFilters(filter) : 0}
          onPress={mode === 'date' ? () => setFilterOpen(true) : undefined}
        />
      </View>
      <ModeToggle mode={mode} onChange={setMode} />
      <SportSheet
        visible={sportOpen}
        selected={sport}
        onClose={() => setSportOpen(false)}
        onSelect={setSport}
      />
      {mode === 'date' ? (
        <DateSearch
          area={area}
          sport={sport}
          filter={filter}
          filterOpen={filterOpen}
          onFilterClose={() => setFilterOpen(false)}
          onFilterApply={setFilter}
        />
      ) : (
        <TeamSearch area={area} sport={sport} />
      )}
      <AreaSheet
        visible={areaOpen}
        area={area}
        onClose={() => setAreaOpen(false)}
        onApply={setArea}
      />
    </SafeAreaView>
  );
}

interface DateSearchProps {
  area: AreaSelection;
  sport: Sport | null;
  filter: OpportunityFilter;
  filterOpen: boolean;
  onFilterClose: () => void;
  onFilterApply: (filter: OpportunityFilter) => void;
}

/** 日付でさがす: 日付ストリップ+募集カードグリッド */
function DateSearch({
  area,
  sport,
  filter,
  filterOpen,
  onFilterClose,
  onFilterApply,
}: DateSearchProps) {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const dates = useMemo(
    () => Array.from({ length: DAYS_TO_SHOW }, (_, i) => dateFromToday(i)),
    [],
  );
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const favorites = useFavorites();
  const opportunities = useOpportunities();

  // 選択日+選択エリア+競技チップ適用後の募集を近い順で。シートの件数プレビューにも使う
  const dayItems = useMemo(
    () =>
      opportunities
        .filter(
          (r) =>
            r.date === selectedDate &&
            matchesArea(r.prefecture, area) &&
            (sport === null || r.sport === sport),
        )
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [opportunities, selectedDate, area, sport],
  );

  const listData = useMemo(
    () => padToColumns(applyFilter(dayItems, filter)),
    [dayItems, filter],
  );

  const renderItem = ({ item }: { item: GridItem }) => {
    if (isSpacer(item)) return <View style={styles.cardSpacer} />;
    return (
      <OpportunityCard
        item={item}
        isFavorite={favorites.has(item.id)}
        onToggleFavorite={toggleFavorite}
        onPress={(r) =>
          router.push({ pathname: '/opportunity/[id]', params: { id: r.id } })
        }
      />
    );
  };

  return (
    <>
      <DateStrip dates={dates} selected={selectedDate} onSelect={setSelectedDate} />
      <FilterSheet
        visible={filterOpen}
        filter={filter}
        candidates={dayItems}
        onClose={onFilterClose}
        onApply={onFilterApply}
      />
      <FlatList
        key={`grid-${GRID_COLUMNS}`}
        style={styles.list}
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={GRID_COLUMNS}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>この日の募集はまだありません</Text>
            <Text style={styles.emptyHint}>別の日付を選んでみてください</Text>
          </View>
        }
      />
    </>
  );
}

/** チームでさがす: 検索バー+チームカード一覧 */
function TeamSearch({ area, sport }: { area: AreaSelection; sport: Sport | null }) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const teams = useTeams();

  const listData = useMemo(() => {
    // モックのチームはすべて東京都
    const areaTeams = teams.filter(
      (t) => matchesArea('東京都', area) && (sport === null || t.sport === sport),
    );
    const q = query.trim();
    if (!q) return areaTeams;
    return areaTeams.filter(
      (t) => t.name.includes(q) || t.ward.includes(q) || (t.homeGround?.includes(q) ?? false),
    );
  }, [teams, query, area, sport]);

  return (
    <>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="チーム名・エリアで検索"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>
      <FlatList
        style={styles.list}
        data={listData}
        keyExtractor={(item: Team) => item.id}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onPress={(t) => router.push({ pathname: '/team/[id]', params: { id: t.id } })}
          />
        )}
        contentContainerStyle={styles.teamListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>見つかりませんでした</Text>
            <Text style={styles.emptyHint}>キーワードを変えて試してください</Text>
          </View>
        }
      />
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    // リスト側だけを伸縮させ、日付ストリップなど上の要素を潰さない
    list: {
      flex: 1,
    },
    // 最上段: 左にエリアバー、右に絞りこみ
    headerRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      marginTop: Spacing.two,
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
    teamListContent: {
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: 88,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      marginHorizontal: Spacing.three,
      marginTop: Spacing.two,
      height: 38,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: c.text,
      paddingVertical: 0,
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
