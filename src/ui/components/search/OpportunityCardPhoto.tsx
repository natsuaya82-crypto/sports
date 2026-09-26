import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import { Brand, Palette, getOpportunityKindColor } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Opportunity, getOpportunityKindLabel } from '@/domain/opportunity';

interface Props {
  item: Opportunity;
  /** 締切・満員で応募を受け付けていない状態 */
  isClosed: boolean;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}

/** 募集カードの写真まわり(種別バッジ・おきにいり・締切オーバーレイ) */
export function OpportunityCardPhoto({
  item,
  isClosed,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.photoWrap}>
      <Image source={{ uri: item.photo }} style={styles.photo} contentFit="cover" />
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: getOpportunityKindColor(item.kind, colors.tagText) },
        ]}>
        <SportIcon sport={item.sport} size={11} color="#ffffff" />
        <Text style={styles.typeBadgeText}>{getOpportunityKindLabel(item.kind)}</Text>
      </View>
      <Pressable
        onPress={() => onToggleFavorite(item.id)}
        hitSlop={8}
        style={styles.heartButton}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={20}
          color={isFavorite ? Brand.danger : '#ffffff'}
        />
      </Pressable>
      {isClosed && (
        <View style={styles.closedOverlay}>
          <View style={styles.closedRibbon}>
            <Text style={styles.closedText}>締切</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    photoWrap: {
      aspectRatio: 4 / 3,
    },
    photo: {
      width: '100%',
      height: '100%',
      backgroundColor: c.backgroundElement,
    },
    typeBadge: {
      position: 'absolute',
      top: 8,
      left: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 3,
    },
    typeBadgeText: {
      color: '#ffffff',
      fontSize: 10,
      fontWeight: '700',
    },
    heartButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    closedOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.veil,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closedRibbon: {
      backgroundColor: Brand.danger,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 4,
      transform: [{ rotate: '-12deg' }],
    },
    closedText: {
      color: '#ffffff',
      fontSize: 13,
      fontWeight: '800',
    },
  });
