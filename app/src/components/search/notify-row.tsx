import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { Brand, Palette, Spacing } from '@/constants/theme';
import { useThemedStyles } from '@/contexts/theme-context';

/** 「この日の新しい募集を通知 ⚪」の行(日付表示はストリップに任せる) */
export function NotifyRow() {
  const [enabled, setEnabled] = useState(false);
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.notifyLabel}>この日の新しい募集を通知</Text>
      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{ true: Brand.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: Spacing.two,
    },
    notifyLabel: {
      fontSize: 12,
      color: c.textSecondary,
    },
  });
