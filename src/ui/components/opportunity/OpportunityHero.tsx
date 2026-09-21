import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SportIcon } from '@/ui/components/Icons';
import { Brand, getOpportunityKindColor, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { getOpportunityKindLabel, type Opportunity } from '@/domain/opportunity';

interface Props {
  opportunity: Opportunity;
  isFavorite: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
}

/** 募集詳細のヘッダー写真。戻る・おきにいり・種別バッジを重ねる */
export function OpportunityHero({
  opportunity,
  isFavorite,
  onBack,
  onToggleFavorite,
}: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.photoWrap}>
      <Image source={{ uri: opportunity.photo }} style={styles.photo} contentFit="cover" />
      <SafeAreaView edges={['top']} style={styles.photoTop}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#ffffff" />
        </Pressable>
        <Pressable onPress={onToggleFavorite} style={styles.backButton} hitSlop={8}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? Brand.danger : '#ffffff'}
          />
        </Pressable>
      </SafeAreaView>
      <View
        style={[
          styles.typeBadge,
          { backgroundColor: getOpportunityKindColor(opportunity.kind, colors.tagText) },
        ]}>
        <SportIcon sport={opportunity.sport} size={12} color="#ffffff" />
        <Text style={styles.typeBadgeText}>
          {getOpportunityKindLabel(opportunity.kind)}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    photoWrap: {
      height: 220,
    },
    photo: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.backgroundElement,
    },
    photoTop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    backButton: {
      margin: Spacing.two,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    typeBadge: {
      position: 'absolute',
      left: Spacing.three,
      bottom: Spacing.two,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    typeBadgeText: {
      color: '#ffffff',
      fontSize: 11,
      fontWeight: '700',
    },
  });
