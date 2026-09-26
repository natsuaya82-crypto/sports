import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { BadgeList } from '@/ui/components/BadgeList';
import { LevelBadge } from '@/ui/components/LevelBadge';
import { Screen } from '@/ui/components/Screen';
import { SportIcon } from '@/ui/components/Icons';
import { ListRow, ListRowBody, ListRowChevron } from '@/ui/components/list/ListRow';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { SearchField } from '@/ui/components/search/SearchField';
import { SelectableChip } from '@/ui/components/SelectableChip';
import { Palette, Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useParticipations } from '@/ui/hooks/use-participations';
import { fetchUsers } from '@/data/user-store';
import { getDateFromToday } from '@/lib/local-date';
import { getUserBadges } from '@/domain/badge';
import { getCriteriaFromUser, rankUsers } from '@/domain/discovery';
import { SPORTS, Sport, getSportLabel } from '@/domain/sport';
import { findScoutCandidates, getMainSport, type User } from '@/domain/user';

/** 競技の絞りこみ。メイン競技だけでなく登録している種目すべてを見る */
/** メイン競技の表示名。種目が未登録なら表示しない */
function mainSportLabel(user: User): string | undefined {
  const sport = getMainSport(user);
  return sport === undefined ? undefined : getSportLabel(sport);
}

/** 個人をスカウト: 検索+競技絞り+一覧 */
export default function ScoutScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { sport: sportParam } = useLocalSearchParams<{ sport?: string }>();
  const currentUser = useCurrentUser();
  const records = useParticipations();
  const today = getDateFromToday(0);

  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | null>(
    (sportParam as Sport | undefined) ?? null,
  );

  const listData = useMemo(
    () =>
      rankUsers(
        findScoutCandidates(fetchUsers(), {
          viewerId: currentUser.id,
          sport,
          keyword: query,
        }),
        { criteria: getCriteriaFromUser(currentUser), records, today },
      ),
    [query, sport, currentUser, records, today],
  );

  const renderItem = ({ item }: { item: User }) => (
    <ListRow
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.id } })}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <ListRowBody gap={2}>
        <View style={styles.nameRow}>
          {getMainSport(item) !== undefined && (
            <SportIcon sport={item.sports[0]} size={13} color={colors.text} />
          )}
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName}
          </Text>
          <LevelBadge
            level={item.level}
            iconSize={9}
            style={styles.levelBadge}
            textStyle={styles.levelText}
          />
          <BadgeList
            badges={getUserBadges(item, records, today)}
            style={styles.levelBadge}
            textStyle={styles.levelText}
          />
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {[mainSportLabel(item), item.position, item.ward, item.age]
            .filter(Boolean)
            .join(' ・ ')}
        </Text>
        {item.playStyle !== undefined && (
          <Text style={styles.playStyle} numberOfLines={1}>
            {item.playStyle}
          </Text>
        )}
      </ListRowBody>
      <ListRowChevron />
    </ListRow>
  );

  return (
    <Screen>
      <ScreenHeader title="個人をスカウト" />

      {/* 検索 */}
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="ポジション・エリア・名前で検索"
        style={styles.searchBar}
      />

      {/* 競技チップ */}
      <View style={styles.chipRow}>
        <SelectableChip
          label="すべて"
          selected={sport === null}
          onPress={() => setSport(null)}
          style={styles.chip}
          selectedTextStyle={styles.chipTextSelected}
        />
        {SPORTS.map((s) => (
          <SelectableChip
            key={s}
            label={getSportLabel(s)}
            selected={sport === s}
            onPress={() => setSport(sport === s ? null : s)}
            style={styles.chip}
            selectedTextStyle={styles.chipTextSelected}
          />
        ))}
      </View>

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>該当する個人が見つかりませんでした</Text>
          </View>
        }
      />
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    searchBar: { marginTop: Spacing.two },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    chip: { paddingHorizontal: 12, paddingVertical: 6 },
    chipTextSelected: { fontWeight: '700' },
    listContent: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.backgroundElement,
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    name: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text },
    levelBadge: {
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    levelText: { fontSize: 9 },
    meta: { fontSize: 11, color: c.textSecondary },
    playStyle: { fontSize: 11, color: c.textSecondary },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 13, color: c.textSecondary },
  });
