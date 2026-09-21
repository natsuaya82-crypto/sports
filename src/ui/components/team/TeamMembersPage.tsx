import { StyleSheet, Text, View } from 'react-native';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamPageTitle } from './TeamPageTitle';

/** メンバーページ */
export function TeamMembersPage({ team, isDesktop }: { team: Team; isDesktop: boolean }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="MEMBERS" jp="メンバー" color={team.color} />
      <View style={styles.memberGrid}>
        {(team.roster ?? []).map((m) => (
          <View
            key={`${m.name}-${m.number ?? ''}`}
            style={[styles.memberCard, isDesktop && styles.memberCardDesktop]}>
            <View style={[styles.memberNumber, { backgroundColor: team.color }]}>
              <Text style={styles.memberNumberText}>
                {m.number != null ? m.number : '-'}
              </Text>
            </View>
            <View style={styles.memberBody}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {m.name}
                </Text>
                {m.title && (
                  <View style={[styles.memberRole, { backgroundColor: `${team.color}1A` }]}>
                    <Text style={[styles.memberRoleText, { color: team.color }]}>
                      {m.title}
                    </Text>
                  </View>
                )}
              </View>
              {m.position && <Text style={styles.memberPosition}>{m.position}</Text>}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    memberGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
      width: '48%',
      flexGrow: 1,
    },
    memberCardDesktop: {
      width: '23%',
      flexGrow: 0,
    },
    memberNumber: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberNumberText: {
      fontSize: 14,
      fontWeight: '900',
      color: '#ffffff',
    },
    memberBody: {
      flex: 1,
      gap: 1,
    },
    memberNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    memberName: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
      flexShrink: 1,
    },
    memberRole: {
      borderRadius: 999,
      paddingHorizontal: 6,
      paddingVertical: 1,
    },
    memberRoleText: {
      fontSize: 9,
      fontWeight: '800',
    },
    memberPosition: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
    },
  });
