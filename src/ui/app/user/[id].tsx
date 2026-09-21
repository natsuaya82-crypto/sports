import { BottomBar } from '@/ui/components/BottomBar';
import { Screen } from '@/ui/components/Screen';
import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon, SportIcon } from '@/ui/components/Icons';
import { ProfileInfoCard } from '@/ui/components/profile/ProfileInfoCard';
import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { findUser } from '@/data/user-store';
import { getLevelLabel } from '@/domain/level';
import { getOpportunityKindLabel } from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';
import { getMainSport } from '@/domain/user';

/** 個人の公開プロフィール(スカウトの受け皿) */
export default function UserProfileScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const user = findUser(id ?? '');

  if (!user) {
    return (
      <NotFoundScreen message="プロフィールが見つかりませんでした" showBack />
    );
  }

  const mainSport = getMainSport(user);
  const wantedKinds = user.wantedKinds ?? [];

  return (
    <Screen edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* ヒーロー */}
        <View style={styles.hero}>
          <Image source={{ uri: user.avatar }} style={styles.heroImage} contentFit="cover" />
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
            <Text style={styles.heroName}>{user.displayName}</Text>
            <View style={styles.heroChips}>
              <View style={styles.heroChip}>
                <Text style={styles.heroChipText}>
                  {[
                    mainSport === undefined ? undefined : getSportLabel(mainSport),
                    user.ward,
                    user.age,
                  ]
                    .filter(Boolean)
                    .join(' ・ ')}
                </Text>
              </View>
              <View style={[styles.heroChip, { backgroundColor: LevelColors[user.level] }]}>
                {user.level === 'serious' && <FlameIcon size={10} color="#ffffff" />}
                <Text style={styles.heroChipText}>{getLevelLabel(user.level)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* 種目 */}
          <View style={styles.sportsRow}>
            {user.sports.map((s) => (
              <View key={s} style={styles.sportChip}>
                <SportIcon sport={s} size={12} color={colors.text} />
                <Text style={styles.sportChipText}>{getSportLabel(s)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.bio}>{user.bio}</Text>

          {/* 詳細 */}
          <ProfileInfoCard user={user} />

          {/* 希望する参加形態(未設定なら出さない) */}
          {wantedKinds.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>希望する参加形態</Text>
              <View style={styles.formRow}>
                {wantedKinds.map((f) => (
                  <View key={f} style={styles.formBadge}>
                    <Text style={styles.formText}>{getOpportunityKindLabel(f)}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* スカウトCTA */}
      <BottomBar>
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}>
          <Ionicons name="send-outline" size={16} color={Brand.onPrimary} />
          <Text style={styles.ctaText}>この人をスカウトする</Text>
        </Pressable>
      </BottomBar>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
  });
