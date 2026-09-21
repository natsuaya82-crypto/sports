import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

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
  const styles = useThemedStyles(makeEditFormStyles);
  const [color, setColor] = useState(team.color);

  return (
    <TeamFormScaffold canSave color={color} onSave={() => onSave({ color })}>
      <Text style={styles.sectionHint}>
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
