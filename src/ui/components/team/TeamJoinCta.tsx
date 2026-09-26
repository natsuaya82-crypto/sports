import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { Team } from '@/domain/team';
import { isRecruiting } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

/** 応募/連絡CTA */
export function TeamJoinCta({ team }: { team: Team }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ctaButton,
        { backgroundColor: team.color },
        pressed && styles.ctaPressed,
      ]}>
      <Ionicons name="paper-plane-outline" size={16} color="#ffffff" />
      <Text style={styles.ctaText}>
        {isRecruiting(team) ? 'このチームに応募する' : 'このチームに連絡する'}
      </Text>
    </Pressable>
  );
}

const makeStyles = (_c: Palette) =>
  StyleSheet.create({
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 999,
      paddingVertical: 14,
      marginTop: Spacing.two,
    },
    ctaPressed: {
      opacity: 0.85,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#ffffff',
    },
  });
