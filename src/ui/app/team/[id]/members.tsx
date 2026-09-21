import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import type { TeamRosterEntry } from '@/domain/team';
import { useTeam } from '@/ui/hooks/use-teams';

/** メンバー管理(チームのメンバー一覧) */
export default function MembersScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const members = team?.roster ?? [];

  const renderItem = ({ item }: { item: TeamRosterEntry }) => (
    <View style={styles.row}>
      <View style={[styles.number, { backgroundColor: team?.color ?? Brand.primary }]}>
        <Text style={styles.numberText}>{item.number != null ? item.number : '-'}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {item.title && (
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{item.title}</Text>
            </View>
          )}
        </View>
        {item.position && <Text style={styles.position}>{item.position}</Text>}
      </View>
      <Pressable hitSlop={8}>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>メンバー管理</Text>
        <View style={styles.headerSide} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item, i) => `${item.name}-${item.number ?? i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.count}>{members.length}人が所属</Text>
        }
        ListFooterComponent={
          <Pressable style={styles.addRow}>
            <Ionicons name="person-add-outline" size={16} color={Brand.primary} />
            <Text style={styles.addText}>メンバーを招待する</Text>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>まだメンバーがいません</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    listContent: { padding: Spacing.three, gap: Spacing.two },
    count: { fontSize: 12, color: c.textSecondary, marginBottom: Spacing.one },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    number: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberText: { fontSize: 15, fontWeight: '900', color: '#ffffff' },
    rowBody: { flex: 1, gap: 2 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { fontSize: 14, fontWeight: '700', color: c.text },
    roleBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    roleText: { fontSize: 10, fontWeight: '800', color: Brand.primary },
    position: { fontSize: 11, color: c.textSecondary },
    addRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: Brand.primary,
      marginTop: Spacing.one,
    },
    addText: { fontSize: 13, fontWeight: '700', color: Brand.primary },
    empty: { alignItems: 'center', paddingTop: 60 },
    emptyText: { fontSize: 13, color: c.textSecondary },
  });
