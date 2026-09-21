import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, TextInput, View } from 'react-native';

import { ListEmptyState } from '@/ui/components/ListEmptyState';
import { TeamCard } from '@/ui/components/search/TeamCard';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useTeams } from '@/ui/hooks/use-teams';
import type { AreaSelection } from '@/domain/area';
import { isInArea } from '@/domain/area';
import type { Sport } from '@/domain/sport';
import type { Team } from '@/domain/team';

interface Props {
  area: AreaSelection;
  sport: Sport | null;
  onPressTeam: (id: string) => void;
}

/** チームでさがす: 検索バー+チームカード一覧 */
export function TeamSearch({ area, sport, onPressTeam }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const teams = useTeams();

  const listData = useMemo(() => {
    const areaTeams = teams.filter(
      (t) => isInArea(t.prefecture, area) && (sport === null || t.sport === sport),
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
          <TeamCard team={item} onPress={(t) => onPressTeam(t.id)} />
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
  });
