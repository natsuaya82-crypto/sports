import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon, SportIcon } from '@/ui/components/Icons';
import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { fetchUsers } from '@/data/user-store';
import { getLevelLabel } from '@/domain/level';
import { SPORTS, Sport, getSportLabel } from '@/domain/sport';
import { getMainSport, hasPublicProfile, type User } from '@/domain/user';

/** 競技の絞りこみ。メイン競技だけでなく登録している種目すべてを見る */
function matchesSport(user: User, sport: Sport | null): boolean {
  return sport === null || user.sports.includes(sport);
}

/** ポジション・エリア・名前での検索 */
function matchesQuery(user: User, query: string): boolean {
  if (query === '') return true;
  return (
    user.displayName.includes(query) ||
    user.ward.includes(query) ||
    (user.position?.includes(query) ?? false) ||
    (user.playStyle?.includes(query) ?? false)
  );
}

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

  const [query, setQuery] = useState('');
  const [sport, setSport] = useState<Sport | null>(
    (sportParam as Sport | undefined) ?? null,
  );

  const listData = useMemo(() => {
    const q = query.trim();
    return fetchUsers().filter(
      (u) =>
        u.id !== currentUser.id &&
        hasPublicProfile(u) &&
        matchesSport(u, sport) &&
        matchesQuery(u, q),
    );
  }, [query, sport, currentUser.id]);

  const renderItem = ({ item }: { item: User }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push({ pathname: '/user/[id]', params: { id: item.id } })}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          {getMainSport(item) !== undefined && (
            <SportIcon sport={item.sports[0]} size={13} color={colors.text} />
          )}
          <Text style={styles.name} numberOfLines={1}>
            {item.displayName}
          </Text>
          <View style={[styles.levelBadge, { borderColor: LevelColors[item.level] }]}>
            {item.level === 'serious' && (
              <FlameIcon size={9} color={LevelColors[item.level]} />
            )}
            <Text style={[styles.levelText, { color: LevelColors[item.level] }]}>
              {getLevelLabel(item.level)}
            </Text>
          </View>
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
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>個人をスカウト</Text>
        <View style={styles.headerSide} />
      </View>

      {/* 検索 */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ポジション・エリア・名前で検索"
          placeholderTextColor={colors.textSecondary}
          style={styles.searchInput}
        />
      </View>

      {/* 競技チップ */}
      <View style={styles.chipRow}>
        <Chip label="すべて" selected={sport === null} onPress={() => setSport(null)} />
        {SPORTS.map((s) => (
          <Chip
            key={s}
            label={getSportLabel(s)}
            selected={sport === s}
            onPress={() => setSport(sport === s ? null : s)}
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
    </SafeAreaView>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerSide: { width: 32, alignItems: 'flex-start' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: c.text },
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
    searchInput: { flex: 1, fontSize: 13, color: c.text, paddingVertical: 0 },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: c.backgroundElement,
    },
    chipSelected: { backgroundColor: Brand.primary },
    chipText: { fontSize: 12, fontWeight: '600', color: c.text },
    chipTextSelected: { color: Brand.onPrimary, fontWeight: '700' },
    listContent: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.backgroundElement,
    },
    cardBody: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    name: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    levelText: { fontSize: 9, fontWeight: '700' },
    meta: { fontSize: 11, color: c.textSecondary },
    playStyle: { fontSize: 11, color: c.textSecondary },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 13, color: c.textSecondary },
  });
