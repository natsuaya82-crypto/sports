import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Palette } from '@/ui/theme';
import { Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import type { User } from '@/domain/user';

/** 個人LPの詳細カード。未設定の項目は行ごと出さない */
export function ProfileInfoCard({ user }: { user: User }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.infoCard}>
      {user.position && (
        <InfoRow icon="location-outline" label="ポジション" value={user.position} />
      )}
      {user.playStyle && (
        <InfoRow icon="football-outline" label="プレー" value={user.playStyle} />
      )}
      {user.experience && (
        <InfoRow icon="ribbon-outline" label="経歴" value={user.experience} />
      )}
      {user.availability && (
        <InfoRow icon="time-outline" label="活動可能" value={user.availability} />
      )}
    </View>
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
    infoCard: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 12,
      marginTop: Spacing.one,
    },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
    infoLabel: {
      width: 72,
      fontSize: 12,
      fontWeight: '600',
      color: c.textSecondary,
    },
    infoValue: { flex: 1, fontSize: 12, fontWeight: '600', color: c.text, lineHeight: 18 },
  });
