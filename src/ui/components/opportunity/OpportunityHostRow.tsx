import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { ShieldIcon } from '@/ui/components/Icons';
import { ListRow, ListRowBody, ListRowChevron } from '@/ui/components/list/ListRow';
import { Palette } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import type { Opportunity } from '@/domain/opportunity';
import type { Team } from '@/domain/team';

interface Props {
  opportunity: Opportunity;
  /** 主催チーム。このアプリに登録の無い主催なら undefined */
  team: Team | undefined;
  onPressTeam: (id: string) => void;
}

/** 募集詳細の主催欄。登録済みチームなら公式サイトへ遷移する */
export function OpportunityHostRow({ opportunity, team, onPressTeam }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <ListRow onPress={team ? () => onPressTeam(team.id) : undefined}>
      {team ? (
        <Image source={{ uri: team.photo }} style={styles.teamPhoto} contentFit="cover" />
      ) : (
        <View style={styles.teamPhotoFallback}>
          <ShieldIcon size={18} color={colors.textSecondary} />
        </View>
      )}
      <ListRowBody gap={1}>
        <Text style={styles.teamName}>{opportunity.hostTeamName}</Text>
        <Text style={styles.teamHint}>
          {team ? '公式サイトを見る' : 'このアプリで募集中'}
        </Text>
      </ListRowBody>
      {team && <ListRowChevron />}
    </ListRow>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
    teamName: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    teamHint: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
