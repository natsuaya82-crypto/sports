import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon, ShieldIcon, SportIcon } from '@/ui/components/Icons';
import {
  Brand,
  LevelColors,
  Palette,
  OpportunityKindColors,
  Spacing,
} from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { apply, useApplications } from '@/data/application-store';
import { toggleFavorite, useFavorites } from '@/data/favorites-store';
import { useOpportunities } from '@/data/opportunity-store';
import { useTeams } from '@/data/team-store';
import { getLevelLabel } from '@/domain/level';
import { getOpportunityKindLabel, getRemainingCapacity } from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';

function formatDateWithWeekday(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
  return `${m}月${d}日(${weekday})`;
}

/** 募集詳細。応募のスタート地点 */
export default function RecruitmentDetailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();

  const opportunity = useOpportunities().find((r) => r.id === id);
  const teams = useTeams();
  const favorites = useFavorites();
  const applications = useApplications();

  if (!opportunity) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>募集が見つかりませんでした</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notFoundBack}>もどる</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const team = teams.find((t) => t.name === opportunity.teamName);
  const application = applications.find((a) => a.opportunityId === opportunity.id);
  const remaining = getRemainingCapacity(opportunity);
  const isClosed = opportunity.closed || remaining === 0;
  const isFavorite = favorites.has(opportunity.id);

  const onApply = () => {
    const a = apply(opportunity, 'はじめまして!募集を見て応募しました。よろしくお願いします!');
    router.push({ pathname: '/chat/[id]', params: { id: a.id } });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* 写真 */}
        <View style={styles.photoWrap}>
          <Image source={{ uri: opportunity.photo }} style={styles.photo} contentFit="cover" />
          <SafeAreaView edges={['top']} style={styles.photoTop}>
            <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color="#ffffff" />
            </Pressable>
            <Pressable
              onPress={() => toggleFavorite(opportunity.id)}
              style={styles.backButton}
              hitSlop={8}>
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? Brand.danger : '#ffffff'}
              />
            </Pressable>
          </SafeAreaView>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: getOpportunityKindColor(opportunity.type, Palette.tagText) },
            ]}>
            <SportIcon sport={opportunity.sport} size={12} color="#ffffff" />
            <Text style={styles.typeBadgeText}>
              {getOpportunityKindLabel(opportunity.type)}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{opportunity.title}</Text>

          <View style={styles.badgeRow}>
            <View
              style={[styles.levelBadge, { borderColor: LevelColors[opportunity.level] }]}>
              {opportunity.level === 'serious' && (
                <FlameIcon size={11} color={LevelColors[opportunity.level]} />
              )}
              <Text
                style={[styles.levelText, { color: LevelColors[opportunity.level] }]}>
                {getLevelLabel(opportunity.level)}
              </Text>
            </View>
            {isClosed ? (
              <View style={styles.closedBadge}>
                <Text style={styles.closedBadgeText}>締切</Text>
              </View>
            ) : (
              <Text style={[styles.remaining, remaining <= 2 && styles.remainingFew]}>
                残り{remaining}枠
              </Text>
            )}
          </View>

          {/* 開催情報 */}
          <View style={styles.infoCard}>
            <InfoRow
              icon="calendar-outline"
              label="日時"
              value={`${formatDateWithWeekday(opportunity.date)} ${opportunity.startTime}〜${opportunity.endTime}`}
            />
            <InfoRow
              icon="location-outline"
              label="場所"
              value={`${opportunity.venueName}(${opportunity.ward})`}
            />
            <InfoRow
              icon="cash-outline"
              label="参加費"
              value={opportunity.fee === 0 ? '無料' : `¥${opportunity.fee.toLocaleString()}`}
            />
            <InfoRow
              icon="pricetag-outline"
              label="競技"
              value={getSportLabel(opportunity.sport)}
            />
            <InfoRow
              icon="people-outline"
              label="募集人数"
              value={`${opportunity.capacity}人(${opportunity.filled}人参加済み)`}
            />
          </View>

          {/* 主催 */}
          <Text style={styles.sectionTitle}>主催</Text>
          <Pressable
            style={styles.teamRow}
            onPress={
              team
                ? () => router.push({ pathname: '/team/[id]', params: { id: team.id } })
                : undefined
            }>
            {team ? (
              <Image source={{ uri: team.photo }} style={styles.teamPhoto} contentFit="cover" />
            ) : (
              <View style={styles.teamPhotoFallback}>
                <ShieldIcon size={18} color={colors.textSecondary} />
              </View>
            )}
            <View style={styles.teamBody}>
              <Text style={styles.teamName}>{opportunity.teamName}</Text>
              <Text style={styles.teamHint}>
                {team ? '公式サイトを見る' : 'このアプリで募集中'}
              </Text>
            </View>
            {team && (
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* 応募バー */}
      <View style={styles.ctaBar}>
        {application ? (
          <Pressable
            onPress={() =>
              router.push({ pathname: '/chat/[id]', params: { id: application.id } })
            }
            style={[styles.ctaButton, styles.ctaApplied]}>
            <Ionicons name="chatbubble-ellipses-outline" size={16} color={Brand.primary} />
            <Text style={[styles.ctaText, { color: Brand.primary }]}>
              応募済み ・ メッセージを見る
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={isClosed ? undefined : onApply}
            style={({ pressed }) => [
              styles.ctaButton,
              isClosed && styles.ctaDisabled,
              pressed && !isClosed && styles.ctaPressed,
            ]}>
            <Ionicons name="paper-plane-outline" size={16} color={Brand.onPrimary} />
            <Text style={styles.ctaText}>
              {isClosed ? 'この募集は締め切りました' : 'この募集に応募する'}
            </Text>
          </Pressable>
        )}
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
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    scroll: {
      paddingBottom: 104,
    },
    photoWrap: {
      height: 220,
    },
    photo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.backgroundElement,
    },
    photoTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    backButton: {
      margin: Spacing.two,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    typeBadge: {
      position: 'absolute',
      left: Spacing.three,
      bottom: Spacing.two,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    typeBadgeText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '700',
    },
    body: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    title: {
      fontSize: 17,
      fontWeight: '800',
      lineHeight: 24,
      color: c.text,
    },
    badgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    levelBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    levelText: {
      fontSize: 11,
      fontWeight: '700',
    },
    remaining: {
      fontSize: 12,
      fontWeight: '700',
      color: c.textSecondary,
    },
    remainingFew: {
      color: Brand.danger,
    },
    closedBadge: {
      backgroundColor: c.backgroundSelected,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    closedBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 10,
      marginTop: Spacing.one,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    infoLabel: {
      width: 56,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: {
      flex: 1,
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
    },
    teamRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    teamPhoto: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.backgroundElement,
    },
    teamPhotoFallback: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    teamBody: {
      flex: 1,
      gap: 1,
    },
    teamName: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    teamHint: {
      fontSize: 11,
      color: c.textSecondary,
    },
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
    ctaPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    ctaDisabled: {
      backgroundColor: c.backgroundSelected,
    },
    ctaApplied: {
      backgroundColor: c.primarySoft,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    notFoundBack: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.primary,
    },
  });
