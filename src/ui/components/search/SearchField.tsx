import { Ionicons } from '@expo/vector-icons';
import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, TextInput, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  /** 上下の余白は置かれる場所ごとに違うのでpropsで渡す */
  style?: StyleProp<ViewStyle>;
}

/** 虫めがね付きの検索入力欄 */
export function SearchField({
  value,
  onChangeText,
  placeholder,
  autoFocus,
  style,
}: SearchFieldProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.searchBar, style]}>
      <Ionicons name="search" size={16} color={colors.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={styles.searchInput}
        autoFocus={autoFocus}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      marginHorizontal: Spacing.three,
      height: 38,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: c.text,
      paddingVertical: 0,
    },
  });
