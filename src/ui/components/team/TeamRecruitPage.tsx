import { StyleSheet, Text, View } from 'react-native';

import type { Opportunity } from '@/domain/opportunity';
import { getOpportunityKindLabel } from '@/domain/opportunity';
import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamJoinCta } from './TeamJoinCta';
import { TeamOpportunityRow } from './TeamOpportunityRow';
import { TeamPageTitle } from './TeamPageTitle';

/** 参加の流れ */
const JOIN_STEPS: [string, string][] = [
  ['応募する', '気になる募集から応募。プロフィールがそのまま届きます'],
  ['体験参加', '日程をすり合わせて、まずは1回一緒にプレー'],
  ['正式加入', 'お互いフィーリングが合えばメンバーに!単発参加もOK'],
];

/** 募集ページ */
export function TeamRecruitPage({
  team,
  opportunities,
}: {
  team: Team;
  opportunities: Opportunity[];
}) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="RECRUIT" jp="募集" color={team.color} />
      {team.recruitingKinds.length > 0 && (
        <View style={styles.recruitRow}>
          {team.recruitingKinds.map((r) => (
            <View key={r} style={[styles.recruitBadge, { backgroundColor: `${team.color}1A` }]}>
              <Text style={[styles.recruitText, { color: team.color }]}>
                {getOpportunityKindLabel(r)}
              </Text>
            </View>
          ))}
        </View>
      )}
      {/* 常設のメンバー募集 */}
      {team.memberRecruitNote && (
        <View style={[styles.memberNote, { borderColor: team.color }]}>
          <Text style={[styles.memberNoteTitle, { color: team.color }]}>
            メンバー募集中
          </Text>
          <Text style={styles.memberNoteText}>{team.memberRecruitNote}</Text>
        </View>
      )}
      {opportunities.length === 0 && !team.memberRecruitNote ? (
        <Text style={site.emptyText}>現在募集はありません</Text>
      ) : (
        opportunities.map((o) => <TeamOpportunityRow key={o.id} item={o} />)
      )}

      {/* 参加の流れ */}
      <Text style={site.scheduleGroup}>参加の流れ</Text>
      {JOIN_STEPS.map(([title, desc], i) => (
        <View key={title} style={styles.stepRow}>
          <View style={[styles.stepNumber, { backgroundColor: team.color }]}>
            <Text style={styles.stepNumberText}>{i + 1}</Text>
          </View>
          <View style={styles.stepBody}>
            <Text style={styles.stepTitle}>{title}</Text>
            <Text style={styles.stepDesc}>{desc}</Text>
          </View>
        </View>
      ))}

      <TeamJoinCta team={team} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    recruitRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    },
    recruitBadge: {
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 3,
    },
    recruitText: {
      fontSize: 11,
      fontWeight: '700',
    },
    memberNote: {
      borderWidth: 1.5,
      borderRadius: 12,
      padding: Spacing.two,
      gap: 4,
    },
    memberNoteTitle: {
      fontSize: 12,
      fontWeight: '800',
    },
    memberNoteText: {
      fontSize: 12,
      lineHeight: 19,
      color: c.text,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.two,
    },
    stepNumber: {
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
    },
    stepNumberText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#ffffff',
    },
    stepBody: {
      flex: 1,
      gap: 1,
    },
    stepTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    stepDesc: {
      fontSize: 11,
      lineHeight: 16,
      color: c.textSecondary,
    },
  });
