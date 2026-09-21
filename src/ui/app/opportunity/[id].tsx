import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FlameIcon } from '@/ui/components/Icons';
import { OpportunityApplyBar } from '@/ui/components/opportunity/OpportunityApplyBar';
import { OpportunityHero } from '@/ui/components/opportunity/OpportunityHero';
import { OpportunityHostRow } from '@/ui/components/opportunity/OpportunityHostRow';
import { OpportunityInfoCard } from '@/ui/components/opportunity/OpportunityInfoCard';
import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { useCurrentUser } from '@/ui/contexts/auth-context';
import { useApplications } from '@/ui/hooks/use-applications';
import { useFavorites } from '@/ui/hooks/use-favorites';
import { useOpportunity } from '@/ui/hooks/use-opportunities';
import { useTeams } from '@/ui/hooks/use-teams';
import { createApplication } from '@/data/application-store';
import { toggleFavorite } from '@/data/favorite-store';
import { createThread } from '@/data/message-store';
import { getApplicationsByApplicant } from '@/domain/application';
import { getLevelLabel } from '@/domain/level';
import { getRemainingCapacity, isOpen } from '@/domain/opportunity';

/** 応募時に自動で送られる1通目(prototypeの文言) */
const FIRST_MESSAGE = 'はじめまして!募集を見て応募しました。よろしくお願いします!';

/** 募集詳細。応募のスタート地点 */
export default function OpportunityDetailScreen() {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();

  const user = useCurrentUser();
  const opportunity = useOpportunity(id);
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

  const team = teams.find((t) => t.id === opportunity.hostTeamId);
  const application = getApplicationsByApplicant(applications, user.id).find(
    (a) => a.opportunityId === opportunity.id,
  );
  const remaining = getRemainingCapacity(opportunity);
  const isClosed = !isOpen(opportunity);

  const openChat = (applicationId: string) => {
    router.push({ pathname: '/chat/[id]', params: { id: applicationId } });
  };

  const onApply = () => {
    const created = createApplication({
      opportunityId: opportunity.id,
      applicantUserId: user.id,
      applicantTeamId: null,
      message: FIRST_MESSAGE,
    });
    createThread(created.id, FIRST_MESSAGE);
    openChat(created.id);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <OpportunityHero
          opportunity={opportunity}
          isFavorite={favorites.has(opportunity.id)}
          onBack={() => router.back()}
          onToggleFavorite={() => toggleFavorite(opportunity.id)}
        />

        <View style={styles.body}>
          <Text style={styles.title}>{opportunity.title}</Text>

          <View style={styles.badgeRow}>
            <View style={[styles.levelBadge, { borderColor: LevelColors[opportunity.level] }]}>
              {opportunity.level === 'serious' && (
                <FlameIcon size={11} color={LevelColors[opportunity.level]} />
              )}
              <Text style={[styles.levelText, { color: LevelColors[opportunity.level] }]}>
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
          <OpportunityInfoCard opportunity={opportunity} />

          {/* 主催 */}
          <Text style={styles.sectionTitle}>主催</Text>
          <OpportunityHostRow
            opportunity={opportunity}
            team={team}
            onPressTeam={(teamId) =>
              router.push({ pathname: '/team/[id]', params: { id: teamId } })
            }
          />
        </View>
      </ScrollView>

      {/* 応募バー */}
      <OpportunityApplyBar
        isClosed={isClosed}
        isApplied={application !== undefined}
        onApply={onApply}
        onOpenChat={() => {
          if (application !== undefined) openChat(application.id);
        }}
      />
    </SafeAreaView>
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
    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
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
