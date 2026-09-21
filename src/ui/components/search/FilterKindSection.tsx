import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Palette, Spacing, getOpportunityKindColor } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import {
  OpportunityKind,
  getOpportunityKindDescription,
  getOpportunityKindLabel,
} from '@/domain/opportunity';

/**
 * 絞りこみに出す募集タイプ。
 * prototypeに画面があるのはこの4種類だけなので、ここに並べるのもこの4種類にする
 * （残りを出すかはユーザーが決めること。CLAUDE.md 第7章）。
 */
const SELECTABLE_KINDS: readonly OpportunityKind[] = [
  'individual_join',
  'team_member',
  'friendly_match',
  'practice',
];

interface Props {
  selected: OpportunityKind[];
  onToggle: (kind: OpportunityKind) => void;
}

/** 募集タイプの選択カード(説明付き・2×2) */
export function FilterKindSection({ selected, onToggle }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.typeGrid}>
      {SELECTABLE_KINDS.map((kind) => {
        const isSelected = selected.includes(kind);
        const color = getOpportunityKindColor(kind, colors.tagText);
        return (
          <Pressable
            key={kind}
            onPress={() => onToggle(kind)}
            style={[
              styles.typeCard,
              isSelected && { borderColor: color, backgroundColor: `${color}14` },
            ]}>
            <View style={styles.typeCardHead}>
              <View style={[styles.typeDot, { backgroundColor: color }]} />
              <Text style={styles.typeCardLabel}>{getOpportunityKindLabel(kind)}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={16} color={color} />}
            </View>
            <Text style={styles.typeCardDesc}>{getOpportunityKindDescription(kind)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    typeCard: {
      width: '48%',
      flexGrow: 1,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
      gap: 3,
    },
    typeCardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    typeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    typeCardLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    typeCardDesc: {
      fontSize: 10,
      color: c.textSecondary,
    },
  });
