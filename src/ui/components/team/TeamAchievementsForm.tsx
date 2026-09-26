import { useState } from 'react';
import { Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeEditFormStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormAddRow, TeamFormDeleteButton } from './TeamFormAddRow';
import { TeamFormScaffold } from './TeamFormScaffold';

/** 実績 */
export function TeamAchievementsForm({ team, onSave }: TeamEditFormProps) {
  const styles = useThemedStyles(makeEditFormStyles);
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
      <TeamFormAddRow
        value={draft}
        onChangeText={setDraft}
        placeholder="例: 区民大会 ベスト4(2025)"
        onAdd={add}
      />
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
          <TeamFormDeleteButton
            onPress={() => setAchievements((prev) => prev.filter((_, j) => j !== i))}
          />
        </View>
      ))}
    </TeamFormScaffold>
  );
}
