import { View } from 'react-native';

import { SelectableChip } from '@/ui/components/SelectableChip';

import { Card, usePostStyles } from './PostFormParts';
import type { Team } from '@/domain/team';

interface Props {
  /** ログイン中ユーザーが管理しているチーム */
  myTeams: readonly Team[];
  /** 個人として募集する場合の表示名 */
  personalName: string;
  selectedName: string;
  onSelect: (name: string) => void;
}

/** 募集作成: どの名義で募集するか */
export function PostHostCard({
  myTeams,
  personalName,
  selectedName,
  onSelect,
}: Props) {
  const styles = usePostStyles();

  return (
    <Card icon="person-outline" title="募集主体">
      <View style={styles.chipRow}>
        {myTeams.map((t) => (
          <SelectableChip
            key={t.id}
            label={t.name}
            selected={selectedName === t.name}
            onPress={() => onSelect(t.name)}
          />
        ))}
        <SelectableChip
          label={`${personalName}(個人)`}
          selected={selectedName === personalName}
          onPress={() => onSelect(personalName)}
        />
      </View>
    </Card>
  );
}
