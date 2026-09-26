import { useMemo, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { ListEmptyState } from '@/ui/components/ListEmptyState';
import { SearchField } from '@/ui/components/search/SearchField';
import { TeamCard } from '@/ui/components/search/TeamCard';
import { Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useParticipations } from '@/ui/hooks/use-participations';
import { useTeams } from '@/ui/hooks/use-teams';
import { getDateFromToday } from '@/lib/local-date';
import type { AreaSelection } from '@/domain/area';
import { isInArea } from '@/domain/area';
import { getTeamBadges } from '@/domain/badge';
import { getCriteriaFromUser, rankTeams } from '@/domain/discovery';
import type { Sport } from '@/domain/sport';
import type { Team } from '@/domain/team';

interface Props {
  area: AreaSelection;
  sport: Sport | null;
  onPressTeam: (id: string) => void;
}

/** チームでさがす: 検索バー+チームカード一覧 */
export function TeamSearch({ area, sport, onPressTeam }: Props) {
  const [query, setQuery] = useState('');
  const teams = useTeams();
  const currentUser = useCurrentUser();
  const records = useParticipations();
  const today = getDateFromToday(0);

  const listData = useMemo(() => {
    const areaTeams = teams.filter(
      (t) => isInArea(t.prefecture, area) && (sport === null || t.sport === sport),
    );
    const q = query.trim();
    const matched = q
      ? areaTeams.filter(
          (t) =>
            t.name.includes(q) || t.ward.includes(q) || (t.homeGround?.includes(q) ?? false),
        )
      : areaTeams;
    return rankTeams(matched, {
      criteria: getCriteriaFromUser(currentUser),
      records,
      today,
    });
  }, [teams, query, area, sport, currentUser, records, today]);

  return (
    <>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="チーム名・エリアで検索"
        style={styles.searchBar}
      />
      <FlatList
        style={styles.list}
        data={listData}
        keyExtractor={(item: Team) => item.id}
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            badges={getTeamBadges(item, records, today)}
            onPress={(t) => onPressTeam(t.id)}
          />
        )}
        contentContainerStyle={styles.teamListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ListEmptyState
            title="見つかりませんでした"
            hint="キーワードを変えて試してください"
          />
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  // リスト側だけを伸縮させ、検索バーを潰さない
  list: {
    flex: 1,
  },
  teamListContent: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: 88,
  },
  searchBar: {
    marginTop: Spacing.two,
  },
});
