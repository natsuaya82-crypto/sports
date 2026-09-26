import { Text, TextInput } from 'react-native';

import { Card, usePostStyles } from './PostFormParts';
import { useAppTheme } from '@/ui/contexts/theme-context';
import type { Team } from '@/domain/team';

interface Props {
  /** 募集主体で選んだチーム。個人を選んでいる間は undefined */
  hostTeam: Team | undefined;
  note: string;
  onChangeNote: (note: string) => void;
}

/** 募集作成: 常設のメンバー募集文 */
export function PostMemberRecruitCard({ hostTeam, note, onChangeNote }: Props) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();

  return (
    <Card icon="megaphone-outline" title="募集内容(常設)">
      {hostTeam ? (
        <>
          <Text style={styles.hint}>
            「{hostTeam.name}」の公式サイトに掲載され、チーム検索に「メンバー募集」バッジが付きます
          </Text>
          <TextInput
            value={note}
            onChangeText={onChangeNote}
            multiline
            placeholder={'例: DF・GK急募!経験者歓迎。\n毎週水曜19時〜、まずは体験からどうぞ。'}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, styles.inputMultiline]}
          />
        </>
      ) : (
        <Text style={styles.hint}>
          メンバー募集はチームとして行います。「募集主体」でチームを選んでください
        </Text>
      )}
    </Card>
  );
}
