import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { SelectableChip } from '@/ui/components/SelectableChip';

import { Card, FieldLabel, SelectorRow, usePostStyles } from './PostFormParts';
import { feeLabel, type PostSheetKey } from './PostFormOptions';
import { LevelColors } from '@/ui/theme';
import { useAppTheme } from '@/ui/contexts/theme-context';
import { getLevelLabel, LEVELS, type Level } from '@/domain/level';

interface Props {
  fee: number;
  onOpenSheet: (sheet: PostSheetKey) => void;
  level: Level;
  onSelectLevel: (level: Level) => void;
  capacity: number;
  onChangeCapacity: (update: (current: number) => number) => void;
}

const MIN_CAPACITY = 1;
const MAX_CAPACITY = 30;

/** 募集作成: 参加費・レベル・募集人数 */
export function PostConditionCard({
  fee,
  onOpenSheet,
  level,
  onSelectLevel,
  capacity,
  onChangeCapacity,
}: Props) {
  const { colors } = useAppTheme();
  const styles = usePostStyles();

  return (
    <Card icon="options-outline" title="条件">
      <SelectorRow
        label="参加費"
        value={feeLabel(fee)}
        onPress={() => onOpenSheet('fee')}
      />

      <FieldLabel text="レベル" />
      <View style={styles.chipRow}>
        {LEVELS.map((l) => (
          <SelectableChip
            key={l}
            label={getLevelLabel(l)}
            color={LevelColors[l]}
            selected={level === l}
            onPress={() => onSelectLevel(l)}
          />
        ))}
      </View>

      <FieldLabel text="募集人数" />
      <View style={styles.stepperRow}>
        <Pressable
          onPress={() => onChangeCapacity((n) => Math.max(MIN_CAPACITY, n - 1))}
          style={styles.stepperButton}>
          <Ionicons name="remove" size={18} color={colors.text} />
        </Pressable>
        <Text style={styles.stepperValue}>{capacity}人</Text>
        <Pressable
          onPress={() => onChangeCapacity((n) => Math.min(MAX_CAPACITY, n + 1))}
          style={styles.stepperButton}>
          <Ionicons name="add" size={18} color={colors.text} />
        </Pressable>
      </View>
    </Card>
  );
}
