import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import type { Palette } from '@/ui/theme';
import { Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getLevelLabel } from '@/domain/level';
import { getSportLabel } from '@/domain/sport';
import type { User } from '@/domain/user';

/** マイページ先頭の自分のプロフィールと編集ボタン */
export function ProfileSummary({ user, onEdit }: { user: User; onEdit: () => void }) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <View style={styles.profileCard}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <View style={styles.profileBody}>
          <Text style={styles.profileName} numberOfLines={1}>
            {user.displayName}
          </Text>
          <View style={styles.sportsRow}>
            {user.sports.length === 0 ? (
              <Text style={styles.profileMeta}>種目は未設定</Text>
            ) : (
              user.sports.map((s) => (
                <View key={s} style={styles.sportChip}>
                  <SportIcon sport={s} size={11} color={colors.tagText} />
                  <Text style={styles.sportChipText}>{getSportLabel(s)}</Text>
                </View>
              ))
            )}
          </View>
          <Text style={styles.profileMeta}>
            {[user.ward || 'エリア未設定', getLevelLabel(user.level)].join(' ・ ')}
          </Text>
        </View>
      </View>
      <Pressable style={styles.editProfileButton} onPress={onEdit}>
        <Ionicons name="create-outline" size={15} color={colors.text} />
        <Text style={styles.editProfileText}>プロフィールを編集</Text>
      </Pressable>
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    profileCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: c.backgroundElement,
      borderRadius: 12,
      padding: Spacing.three,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: c.backgroundSelected,
    },
    profileBody: {
      flex: 1,
      gap: 4,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
    },
    sportsRow: {
      flexDirection: 'row',
      gap: 4,
      flexWrap: 'wrap',
    },
    sportChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: c.tagBackground,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    sportChipText: {
      fontSize: 10,
      fontWeight: '600',
      color: c.tagText,
    },
    profileMeta: {
      fontSize: 11,
      color: c.textSecondary,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
    },
    editProfileText: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
  });
