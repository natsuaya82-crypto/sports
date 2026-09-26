import { useMemo, useState } from 'react';

import { OpportunityGrid } from '@/ui/components/opportunity/OpportunityGrid';
import { DateStrip } from '@/ui/components/search/DateStrip';
import { FilterSheet } from '@/ui/components/search/FilterSheet';
import { useFavorites } from '@/ui/hooks/use-favorites';
import { useOpportunities } from '@/ui/hooks/use-opportunities';
import type { AreaSelection } from '@/domain/area';
import { isInArea } from '@/domain/area';
import { getOpportunityDate, isScheduled } from '@/domain/opportunity';
import type { OpportunityFilter } from '@/domain/opportunity-filter';
import { filterOpportunities } from '@/domain/opportunity-filter';
import type { Sport } from '@/domain/sport';
import { getDateFromToday } from '@/lib/local-date';

const DAYS_TO_SHOW = 14;

interface Props {
  area: AreaSelection;
  sport: Sport | null;
  filter: OpportunityFilter;
  filterOpen: boolean;
  onFilterClose: () => void;
  onFilterApply: (filter: OpportunityFilter) => void;
  onPressOpportunity: (id: string) => void;
}

/** 日付でさがす: 日付ストリップ+募集カードグリッド */
export function DateSearch({
  area,
  sport,
  filter,
  filterOpen,
  onFilterClose,
  onFilterApply,
  onPressOpportunity,
}: Props) {
  const dates = useMemo(
    () => Array.from({ length: DAYS_TO_SHOW }, (_, i) => getDateFromToday(i)),
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
          (o) =>
            // 日程未定の常設募集は日付軸の一覧に出さない
            isScheduled(o) &&
            getOpportunityDate(o) === selectedDate &&
            isInArea(o.location.prefecture, area) &&
            (sport === null || o.sport === sport),
        )
        .sort((a, b) => a.distanceKm - b.distanceKm),
    [opportunities, selectedDate, area, sport],
  );

  const listData = useMemo(
    () => filterOpportunities(dayItems, filter),
    [dayItems, filter],
  );

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
      <OpportunityGrid
        fillHeight
        items={listData}
        favorites={favorites}
        onPressItem={(o) => onPressOpportunity(o.id)}
        emptyTitle="この日の募集はまだありません"
        emptyHint="別の日付を選んでみてください"
      />
    </>
  );
}
