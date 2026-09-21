import { useState } from 'react';
import { TextInput, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';

import { makeEditFormStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormField } from './TeamFormField';
import { TeamFormScaffold } from './TeamFormScaffold';

/** 活動情報 */
export function TeamActivityForm({ team, onSave }: TeamEditFormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeEditFormStyles);
  const [homeGround, setHomeGround] = useState(team.homeGround ?? '');
  const [schedule, setSchedule] = useState(team.schedule ?? '');
  const [memberCount, setMemberCount] = useState(
    team.memberCount != null ? String(team.memberCount) : '',
  );
  const [ageRange, setAgeRange] = useState(team.ageRange ?? '');
  const [founded, setFounded] = useState(team.founded != null ? String(team.founded) : '');
  const [instagram, setInstagram] = useState(team.instagram ?? '');

  const save = () => {
    const memberCountNum = Number.parseInt(memberCount, 10);
    const foundedNum = Number.parseInt(founded, 10);
    onSave({
      homeGround: homeGround.trim() || undefined,
      schedule: schedule.trim() || undefined,
      memberCount: Number.isFinite(memberCountNum) ? memberCountNum : undefined,
      ageRange: ageRange.trim() || undefined,
      founded: Number.isFinite(foundedNum) ? foundedNum : undefined,
      instagram: instagram.trim() || undefined,
    });
  };

  return (
    <TeamFormScaffold canSave color={team.color} onSave={save}>
      <Text style={styles.sectionHint}>
        空欄の項目はサイトに表示されません(未定ならそのままでOK)
      </Text>
      <TeamFormField label="活動場所">
        <TextInput
          value={homeGround}
          onChangeText={setHomeGround}
          placeholder="例: 二子玉川緑地運動場(固定でなければ空欄)"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </TeamFormField>
      <TeamFormField label="活動日">
        <TextInput
          value={schedule}
          onChangeText={setSchedule}
          placeholder="例: 毎週水曜 19:00〜(不定期なら空欄)"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </TeamFormField>
      <View style={styles.fieldRow}>
        <TeamFormField label="メンバー数" style={styles.fieldHalf}>
          <TextInput
            value={memberCount}
            onChangeText={setMemberCount}
            keyboardType="number-pad"
            placeholder="非公開なら空欄"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </TeamFormField>
        <TeamFormField label="年齢層" style={styles.fieldHalf}>
          <TextInput
            value={ageRange}
            onChangeText={setAgeRange}
            placeholder="例: 20〜30代"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </TeamFormField>
      </View>
      <View style={styles.fieldRow}>
        <TeamFormField label="創設年" style={styles.fieldHalf}>
          <TextInput
            value={founded}
            onChangeText={setFounded}
            keyboardType="number-pad"
            placeholder="例: 2019"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </TeamFormField>
        <TeamFormField label="Instagram" style={styles.fieldHalf}>
          <TextInput
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
            placeholder="@なしのID"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </TeamFormField>
      </View>
    </TeamFormScaffold>
  );
}
