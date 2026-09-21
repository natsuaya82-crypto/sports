import { StyleSheet, Text, View } from 'react-native';

import { getLevelLabel } from '@/domain/level';
import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { TeamInfoRow } from './TeamInfoRow';
import { TeamJoinCta } from './TeamJoinCta';
import { TeamPageTitle } from './TeamPageTitle';

/** チーム情報ページ */
export function TeamAboutPage({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="ABOUT" jp="チーム情報" color={team.color} />
      <Text style={site.bio}>{team.bio}</Text>
      <View style={styles.infoCard}>
        <TeamInfoRow icon="map-outline" label="エリア" value={team.ward} />
        {team.homeGround && (
          <TeamInfoRow icon="location-outline" label="活動場所" value={team.homeGround} />
        )}
        {team.schedule && (
          <TeamInfoRow icon="time-outline" label="活動日" value={team.schedule} />
        )}
        {team.memberCount != null && (
          <TeamInfoRow
            icon="people-outline"
            label="メンバー"
            value={`${team.memberCount}人${team.ageRange ? `(${team.ageRange})` : ''}`}
          />
        )}
        {team.founded != null && (
          <TeamInfoRow icon="flag-outline" label="創設" value={`${team.founded}年`} />
        )}
        <TeamInfoRow
          icon="pulse-outline"
          label="レベル"
          value={getLevelLabel(team.level)}
        />
      </View>
      <TeamJoinCta team={team} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 10,
    },
  });
