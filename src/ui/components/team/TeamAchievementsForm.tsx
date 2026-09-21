import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand } from '@/ui/theme';

import {
  makeEditFieldStyles,
  makeEditFormStyles,
  type TeamEditFormProps,
} from './edit-form';
import { TeamFormScaffold } from './TeamFormScaffold';

/** 実績 */
export function TeamAchievementsForm({ team, onSave }: TeamEditFormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeEditFormStyles);
  const field = useThemedStyles(makeEditFieldStyles);
  const [achievements, setAchievements] = useState<string[]>(team.achievements ?? []);
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setAchievements((prev) => [...prev, text]);
    setDraft('');
  };

  return (
    <TeamFormScaffold
      canSave
      color={team.color}
      onSave={() =>
        onSave({ achievements: achievements.length > 0 ? achievements : undefined })
      }>
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="例: 区民大会 ベスト4(2025)"
          placeholderTextColor={colors.textSecondary}
          style={[field.input, styles.addInput]}
        />
        <Pressable
          onPress={add}
          style={[styles.addButton, !draft.trim() && styles.addButtonDisabled]}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>
      {achievements.length === 0 && (
        <Text style={styles.sectionHint}>
          戦績がなくてもサイトは成立します(戦績ページが非表示になるだけ)
        </Text>
      )}
      {achievements.map((a, i) => (
        <View key={`${a}-${i}`} style={styles.listRow}>
          <Text style={styles.listRowText} numberOfLines={2}>
            {a}
          </Text>
          <Pressable
            onPress={() => setAchievements((prev) => prev.filter((_, j) => j !== i))}
            hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={Brand.danger} />
          </Pressable>
        </View>
      ))}
    </TeamFormScaffold>
  );
}
