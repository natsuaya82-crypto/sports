import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { BottomBar } from '@/ui/components/BottomBar';
import { Brand, Palette } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  /** 応募を受け付けていないか(締切・満員) */
  isClosed: boolean;
  /** 応募済みなら true。やりとりを開く導線に変わる */
  isApplied: boolean;
  onApply: () => void;
  onOpenChat: () => void;
}

/** 募集詳細の下部固定バー。応募のスタート地点 */
export function OpportunityApplyBar({
  isClosed,
  isApplied,
  onApply,
  onOpenChat,
}: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <BottomBar>
      {isApplied ? (
        <Pressable onPress={onOpenChat} style={[styles.ctaButton, styles.ctaApplied]}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color={Brand.primary} />
          <Text style={[styles.ctaText, { color: Brand.primary }]}>
            応募済み ・ メッセージを見る
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={isClosed ? undefined : onApply}
          style={({ pressed }) => [
            styles.ctaButton,
            isClosed && styles.ctaDisabled,
            pressed && !isClosed && styles.ctaPressed,
          ]}>
          <Ionicons name="paper-plane-outline" size={16} color={Brand.onPrimary} />
          <Text style={styles.ctaText}>
            {isClosed ? 'この募集は締め切りました' : 'この募集に応募する'}
          </Text>
        </Pressable>
      )}
    </BottomBar>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: Brand.primary,
      borderRadius: 999,
      paddingVertical: 14,
    },
    ctaPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    ctaDisabled: {
      backgroundColor: c.backgroundSelected,
    },
    ctaApplied: {
      backgroundColor: c.primarySoft,
    },
    ctaText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
  });
