import { Text, TextInput, View } from 'react-native';

import { SelectableChip } from '@/ui/components/SelectableChip';

import { Card, FieldLabel, usePostStyles } from './PostFormParts';
import { POST_KINDS } from './PostFormOptions';
import { getOpportunityKindColor } from '@/ui/theme';
import { useAppTheme } from '@/ui/contexts/theme-context';
import { getOpportunityKindLabel, type OpportunityKind } from '@/domain/opportunity';
import { getSportLabel, SPORTS, type Sport } from '@/domain/sport';

interface Props {
  sport: Sport | null;
  onSelectSport: (sport: Sport) => void;
  kind: OpportunityKind | null;
  onSelectKind: (kind: OpportunityKind) => void;
  title: string;
  onChangeTitle: (title: string) => void;
  /** 常設のメンバー募集はタイトルを持たない */
  isMemberRecruit: boolean;
}

/** 募集作成: 競技・募集タイプ・タイトル */
export function PostContentCard({
  sport,
  onSelectSport,
  kind,
  onSelectKind,
  title,
  onChangeTitle,
  isMemberRecruit,
}: Props) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();

  return (
    <Card icon="megaphone-outline" title="募集の内容">
      <FieldLabel text="競技" />
      <View style={styles.chipRow}>
        {SPORTS.map((s) => (
          <SelectableChip
            key={s}
            label={getSportLabel(s)}
            selected={sport === s}
            onPress={() => onSelectSport(s)}
          />
        ))}
      </View>

      <FieldLabel text="募集タイプ" />
      <View style={styles.chipRow}>
        {POST_KINDS.map((k) => (
          <SelectableChip
            key={k}
            label={getOpportunityKindLabel(k)}
            color={getOpportunityKindColor(k, colors.tagText)}
            selected={kind === k}
            onPress={() => onSelectKind(k)}
          />
        ))}
      </View>

      {!isMemberRecruit && (
        <>
          <FieldLabel text="タイトル" />
          <TextInput
            value={title}
            onChangeText={onChangeTitle}
            placeholder="例: 日曜午前のエンジョイサッカー、助っ人2名!"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </>
      )}
      {isMemberRecruit && (
        <Text style={styles.hint}>
          メンバー募集は日付のない常設の募集です。チームの公式サイトに掲載されます
        </Text>
      )}
    </Card>
  );
}
