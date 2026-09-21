import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon, SportIcon } from '@/components/icons';
import { Brand, LevelColors, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { findPerson } from '@/data/mock-people';
import { LevelLabels, RecruitmentTypeLabels, SportLabels } from '@/types/recruitment';

/** 個人の公開プロフィール(スカウトの受け皿) */
export default function UserProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = findPerson(id ?? '');

  if (!person) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>プロフィールが見つかりませんでした</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notFoundBack}>もどる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const sports = [person.sport, ...(person.otherSports ?? [])];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ヒーロー */}
        <View style={styles.hero}>
          <Image source={{ uri: person.avatar }} style={styles.heroImage} contentFit="cover" />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            locations={[0, 0.4, 1]}
            style={styles.heroGradient}
          />
          <SafeAreaView edges={['top']} style={styles.heroTop}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#ffffff" />
            </Pressable>
          </SafeAreaView>
          <View style={styles.heroContent}>
            <Text style={styles.heroName}>{person.name}</Text>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>
                  {SportLabels[person.sport]} ・ {person.ward}
                  {person.age ? ` ・ ${person.age}` : ''}
                </Text>
              </View>
              <View style={[styles.heroChip, { backgroundColor: LevelColors[person.level] }]}>
                {person.level === 'serious' && <FlameIcon size={10} color="#ffffff" />}
                <Text style={styles.heroChipText}>{LevelLabels[person.level]}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* 種目 */}
          <View style={styles.sportsRow}>
            {sports.map((s) => (
              <View key={s} style={styles.sportChip}>
                <SportIcon sport={s} size={12} color={colors.text} />
                <Text style={styles.sportChipText}>{SportLabels[s]}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bio}>{person.bio}</Text>

          {/* 詳細 */}
          <View style={styles.infoCard}>
            {person.position && (
              <InfoRow icon="location-outline" label="ポジション" value={person.position} />
            )}
            <InfoRow icon="football-outline" label="プレー" value={person.playStyle} />
            <InfoRow icon="ribbon-outline" label="経歴" value={person.experience} />
            <InfoRow icon="time-outline" label="活動可能" value={person.availability} />
          </View>

          {/* 希望する参加形態 */}
          <Text style={styles.sectionTitle}>希望する参加形態</Text>
          <View style={styles.formRow}>
            {person.wantedForms.map((f) => (
              <View key={f} style={styles.formBadge}>
                <Text style={styles.formText}>{RecruitmentTypeLabels[f]}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* スカウトCTA */}
      <View style={styles.ctaBar}>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}>
          <Ionicons name="send-outline" size={16} color={Brand.onPrimary} />
          <Text style={styles.ctaText}>この人をスカウトする</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.textSecondary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    scroll: { paddingBottom: 100 },
    hero: { height: 260 },
    heroImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.backgroundElement,
    },
    heroGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    heroTop: { position: 'absolute', top: 0, left: 0, right: 0 },
    backButton: {
      margin: Spacing.two,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    heroContent: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      gap: 6,
    },
    heroName: { fontSize: 24, fontWeight: '900', color: '#ffffff' },
    heroChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroChipText: { fontSize: 11, fontWeight: '700', color: '#ffffff' },
    body: { padding: Spacing.three, gap: Spacing.two },
    sportsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    sportChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: c.backgroundElement,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    sportChipText: { fontSize: 12, fontWeight: '600', color: c.text },
    bio: { fontSize: 13, lineHeight: 21, color: c.text, marginTop: 2 },
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 12,
      marginTop: Spacing.one,
    },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
    infoLabel: {
      width: 72,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: { flex: 1, fontSize: 12, fontWeight: '600', color: c.text, lineHeight: 18 },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
    },
    formRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    formBadge: {
      backgroundColor: c.primarySoft,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    formText: { fontSize: 12, fontWeight: '700', color: Brand.primary },
    ctaBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      backgroundColor: c.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: Brand.primary,
      borderRadius: 999,
      paddingVertical: 14,
    },
    ctaPressed: { backgroundColor: Brand.primaryPressed },
    ctaText: { fontSize: 14, fontWeight: '800', color: Brand.onPrimary },
    notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
    notFoundText: { fontSize: 14, fontWeight: '700', color: c.text },
    notFoundBack: { fontSize: 13, fontWeight: '700', color: Brand.primary },
  });
