import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand } from '@/ui/theme';

import { makeEditFieldStyles, makeEditFormStyles } from './edit-form';

interface TeamFormAddRowProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onAdd: () => void;
}

/** 項目を1つ書いて追加する入力行 */
export function TeamFormAddRow({
  value,
  onChangeText,
  placeholder,
  onAdd,
}: TeamFormAddRowProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeEditFormStyles);
  const field = useThemedStyles(makeEditFieldStyles);
  return (
    <View style={styles.addRow}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[field.input, styles.addInput]}
      />
      <Pressable
        onPress={onAdd}
        style={[styles.addButton, !value.trim() && styles.addButtonDisabled]}>
        <Text style={styles.addButtonText}>追加</Text>
      </Pressable>
    </View>
  );
}

/** 追加済みの項目を消すゴミ箱ボタン */
export function TeamFormDeleteButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={8}>
      <Ionicons name="trash-outline" size={16} color={Brand.danger} />
    </Pressable>
  );
}
