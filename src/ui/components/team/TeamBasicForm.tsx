import { useState } from 'react';
import { TextInput, View } from 'react-native';

import { LEVELS, getLevelLabel, type Level } from '@/domain/level';
import { SPORTS, getSportLabel, type Sport } from '@/domain/sport';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { LevelColors } from '@/ui/theme';

import { SelectableChip } from '@/ui/components/SelectableChip';

import { makeEditFieldStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormField } from './TeamFormField';
import { TeamFormScaffold } from './TeamFormScaffold';

/** 基本情報 */
export function TeamBasicForm({ team, onSave }: TeamEditFormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeEditFieldStyles);
  const [name, setName] = useState(team.name);
  const [tagline, setTagline] = useState(team.tagline);
  const [bio, setBio] = useState(team.bio);
  const [ward, setWard] = useState(team.ward);
  const [sport, setSport] = useState<Sport>(team.sport);
  const [level, setLevel] = useState<Level>(team.level);

  const canSave = name.trim() !== '' && ward.trim() !== '';

  return (
    <TeamFormScaffold
      canSave={canSave}
      color={team.color}
      onSave={() =>
        onSave({
          name: name.trim(),
          tagline: tagline.trim(),
          bio: bio.trim(),
          ward: ward.trim(),
          sport,
          level,
        })
      }>
      <TeamFormField label="チーム名(必須)">
        <TextInput value={name} onChangeText={setName} style={styles.input} />
      </TeamFormField>
      <TeamFormField label="キャッチコピー" hint="サイトの顔になる一言">
        <TextInput
          value={tagline}
          onChangeText={setTagline}
          placeholder="例: 世田谷から、都リーグへ。"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </TeamFormField>
      <TeamFormField label="チーム紹介">
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          style={[styles.input, styles.inputMultiline]}
        />
      </TeamFormField>
      <TeamFormField label="活動エリア(必須)">
        <TextInput value={ward} onChangeText={setWard} style={styles.input} />
      </TeamFormField>
      <TeamFormField label="競技">
        <View style={styles.chipRow}>
          {SPORTS.map((s) => (
            <SelectableChip
              key={s}
              label={getSportLabel(s)}
              selected={sport === s}
              onPress={() => setSport(s)}
            />
          ))}
        </View>
      </TeamFormField>
      <TeamFormField label="レベル感">
        <View style={styles.chipRow}>
          {LEVELS.map((l) => (
            <SelectableChip
              key={l}
              label={getLevelLabel(l)}
              color={LevelColors[l]}
              selected={level === l}
              onPress={() => setLevel(l)}
            />
          ))}
        </View>
      </TeamFormField>
    </TeamFormScaffold>
  );
}
