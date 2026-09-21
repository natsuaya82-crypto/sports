import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ShieldIcon } from '@/ui/components/Icons';
import { Palette, Spacing } from '@/ui/theme';
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
    <Pressable
      style={styles.teamRow}
      onPress={team ? () => onPressTeam(team.id) : undefined}>
      {team ? (
        <Image source={{ uri: team.photo }} style={styles.teamPhoto} contentFit="cover" />
      ) : (
        <View style={styles.teamPhotoFallback}>
          <ShieldIcon size={18} color={colors.textSecondary} />
        </View>
      )}
      <View style={styles.teamBody}>
        <Text style={styles.teamName}>{opportunity.hostTeamName}</Text>
        <Text style={styles.teamHint}>
          {team ? '公式サイトを見る' : 'このアプリで募集中'}
        </Text>
      </View>
      {team && <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
  });
