import { Text, View } from 'react-native';

import { getLevelLabel } from '@/domain/level';
import type { Team } from '@/domain/team';
import { InfoCard, InfoRow } from '@/ui/components/list/InfoCard';
import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeSiteStyles } from './site-styles';
import { TeamJoinCta } from './TeamJoinCta';
import { TeamPageTitle } from './TeamPageTitle';

/** チーム情報のラベル列の幅 */
const LABEL_WIDTH = 64;

/** チーム情報ページ */
export function TeamAboutPage({ team }: { team: Team }) {
  const site = useThemedStyles(makeSiteStyles);
  return (
    <View style={site.body}>
      <TeamPageTitle en="ABOUT" jp="チーム情報" color={team.color} />
      <Text style={site.bio}>{team.bio}</Text>
      <InfoCard gap={10}>
        <InfoRow
          icon="map-outline"
          label="エリア"
          value={team.ward}
          labelWidth={LABEL_WIDTH}
        />
        {team.homeGround && (
          <InfoRow
            icon="location-outline"
            label="活動場所"
            value={team.homeGround}
            labelWidth={LABEL_WIDTH}
          />
        )}
        {team.schedule && (
          <InfoRow
            icon="time-outline"
            label="活動日"
            value={team.schedule}
            labelWidth={LABEL_WIDTH}
          />
        )}
        {team.memberCount != null && (
          <InfoRow
            icon="people-outline"
            label="メンバー"
            value={`${team.memberCount}人${team.ageRange ? `(${team.ageRange})` : ''}`}
            labelWidth={LABEL_WIDTH}
          />
        )}
        {team.founded != null && (
          <InfoRow
            icon="flag-outline"
            label="創設"
            value={`${team.founded}年`}
            labelWidth={LABEL_WIDTH}
          />
        )}
        <InfoRow
          icon="pulse-outline"
          label="レベル"
          value={getLevelLabel(team.level)}
          labelWidth={LABEL_WIDTH}
        />
      </InfoCard>
      <TeamJoinCta team={team} />
    </View>
  );
}
