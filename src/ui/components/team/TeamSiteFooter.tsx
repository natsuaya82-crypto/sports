import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** サイト共通フッター */
export function TeamSiteFooter({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.siteFooter}>
      {team.instagram && (
        <Pressable style={styles.footerSns}>
          <Ionicons name="logo-instagram" size={16} color={styles.footerSnsText.color} />
          <Text style={styles.footerSnsText}>@{team.instagram}</Text>
        </Pressable>
      )}
      <Text style={styles.footerCopy}>© {team.name}</Text>
      <Text style={styles.footerPowered}>
        この公式サイトは スポマチ(名称未定) で作成されています
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    siteFooter: {
      alignItems: 'center',
      gap: 6,
      marginTop: Spacing.five,
      paddingHorizontal: Spacing.three,
    },
    footerSns: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    footerSnsText: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    footerCopy: {
      fontSize: 11,
      fontWeight: '600',
      color: c.textSecondary,
    },
    footerPowered: {
      fontSize: 10,
      color: c.textSecondary,
    },
  });
