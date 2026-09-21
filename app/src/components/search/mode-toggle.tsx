import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarIcon, ShieldIcon } from '@/components/icons';
import { Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';

export type SearchMode = 'date' | 'team';

interface Props {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}

const OPTIONS: {
  key: SearchMode;
  label: string;
  Icon: typeof CalendarIcon;
}[] = [
  { key: 'date', label: '日付でさがす', Icon: CalendarIcon },
  { key: 'team', label: 'チームでさがす', Icon: ShieldIcon },
];

/** 「日付でさがす / チームでさがす」の切り替えセグメント */
export function ModeToggle({ mode, onChange }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      {OPTIONS.map(({ key, label, Icon }) => {
        const isActive = mode === key;
        const color = isActive ? colors.text : colors.textSecondary;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.segment, isActive && styles.segmentActive]}>
            <Icon size={13} color={color} />
            <Text style={[styles.label, { color }, isActive && styles.labelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      padding: 3,
      marginHorizontal: Spacing.three,
      marginTop: Spacing.two,
    },
    segment: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 8,
      borderRadius: 8,
    },
    segmentActive: {
      backgroundColor: c.background,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 3,
      shadowOffset: { width: 0, height: 1 },
      elevation: 2,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
    },
    labelActive: {
      fontWeight: '700',
    },
  });
