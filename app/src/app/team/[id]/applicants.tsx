import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { Applicant, applicantsForTeam } from '@/data/mock-applicants';
import { findPerson } from '@/data/mock-people';
import { useTeam } from '@/data/team-store';

const STATUS_LABEL: Record<Applicant['status'], string> = {
  new: '新着',
  replied: '返信済み',
  accepted: '参加確定',
};

/** 応募者の確認(チームが受け取った応募) */
export default function ApplicantsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const team = useTeam(id);
  const applicants = useMemo(() => applicantsForTeam(id ?? ''), [id]);

  const renderItem = ({ item }: { item: Applicant }) => {
    const person = findPerson(item.personId);
    return (
      <Pressable
        style={styles.card}
        onPress={() =>
          person &&
          router.push({ pathname: '/user/[id]', params: { id: person.id } })
        }>
        <Image
          source={{ uri: person?.avatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {person?.name ?? '応募者'}
            </Text>
            <View
              style={[
                styles.statusBadge,
                item.status === 'new' && styles.statusNew,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  item.status === 'new' && styles.statusTextNew,
                ]}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
          </View>
          <Text style={styles.recruit} numberOfLines={1}>
            {item.recruitmentTitle}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {item.message}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>応募者の確認</Text>
        <View style={styles.headerSide} />
      </View>

      {team && (
        <Text style={styles.subheader}>
          {team.name} への応募 {applicants.length}件
        </Text>
      )}

      <FlatList
        data={applicants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだ応募がありません</Text>
            <Text style={styles.emptyHint}>募集を出すと、応募がここに届きます</Text>
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
    subheader: {
      fontSize: 12,
      color: c.textSecondary,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
    },
    listContent: { padding: Spacing.three, gap: Spacing.two },
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
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.backgroundElement,
    },
    cardBody: { flex: 1, gap: 3 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: { flex: 1, fontSize: 14, fontWeight: '700', color: c.text },
    statusBadge: {
      backgroundColor: c.backgroundElement,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 1,
    },
    statusNew: { backgroundColor: Brand.danger },
    statusText: { fontSize: 10, fontWeight: '700', color: c.textSecondary },
    statusTextNew: { color: '#ffffff' },
    recruit: { fontSize: 11, fontWeight: '600', color: Brand.primary },
    message: { fontSize: 11, lineHeight: 16, color: c.textSecondary },
    empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.two },
    emptyTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    emptyHint: { fontSize: 12, color: c.textSecondary },
  });
