import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSearch } from '@/ui/components/opportunity/DateSearch';
import { TeamSearch } from '@/ui/components/opportunity/TeamSearch';
import { AreaHeader } from '@/ui/components/search/AreaHeader';
import { AreaSheet } from '@/ui/components/search/AreaSheet';
import { FilterFab } from '@/ui/components/search/FilterFab';
import { ModeToggle, SearchMode } from '@/ui/components/search/ModeToggle';
import { SportSelectButton, SportSheet } from '@/ui/components/search/SportSelect';
import { Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { DEFAULT_AREA, getAreaLabel } from '@/domain/area';
import { countActiveFilters, DEFAULT_FILTER } from '@/domain/opportunity-filter';
import type { Sport } from '@/domain/sport';

export default function SearchScreen() {
  const router = useRouter();
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
        <AreaHeader area={getAreaLabel(area)} onPress={() => setAreaOpen(true)} />
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
          onPressOpportunity={(id) =>
            router.push({ pathname: '/opportunity/[id]', params: { id } })
          }
        />
      ) : (
        <TeamSearch
          area={area}
          sport={sport}
          onPressTeam={(id) => router.push({ pathname: '/team/[id]', params: { id } })}
        />
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    // 最上段: 左にエリアバー、右に絞りこみ
    headerRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      marginTop: Spacing.two,
    },
  });
