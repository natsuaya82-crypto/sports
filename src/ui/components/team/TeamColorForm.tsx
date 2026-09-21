import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeEditFormStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormScaffold } from './TeamFormScaffold';

/** チームカラーの選択肢 */
const COLOR_PRESETS = [
  '#166534',
  '#0DA678',
  '#0284C7',
  '#1D4ED8',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#111827',
];

/** チームカラー */
export function TeamColorForm({ team, onSave }: TeamEditFormProps) {
  const styles = useThemedStyles(makeStyles);
  const form = useThemedStyles(makeEditFormStyles);
  const [color, setColor] = useState(team.color);

  return (
    <TeamFormScaffold canSave color={color} onSave={() => onSave({ color })}>
      <Text style={form.sectionHint}>
        サイトのヘッダー・見出し・ボタンがこの色で統一されます
      </Text>
      <View style={styles.colorRow}>
        {COLOR_PRESETS.map((c2) => (
          <Pressable
            key={c2}
            onPress={() => setColor(c2)}
            style={[
              styles.colorSwatch,
              { backgroundColor: c2 },
              color === c2 && styles.colorSwatchSelected,
            ]}>
            {color === c2 && <Ionicons name="checkmark" size={18} color="#ffffff" />}
          </Pressable>
        ))}
      </View>
      {/* 選択中カラーのプレビュー */}
      <View style={[styles.colorPreview, { backgroundColor: color }]}>
        <Text style={styles.colorPreviewName}>{team.name}</Text>
        <Text style={styles.colorPreviewText}>ヘッダーのイメージ</Text>
      </View>
    </TeamFormScaffold>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    colorSwatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSwatchSelected: {
      borderWidth: 3,
      borderColor: c.backgroundSelected,
    },
    colorPreview: {
      borderRadius: 12,
      padding: Spacing.three,
      gap: 2,
      marginTop: Spacing.two,
    },
    colorPreviewName: {
      fontSize: 15,
      fontWeight: '800',
      color: '#ffffff',
    },
    colorPreviewText: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.85)',
    },
  });
