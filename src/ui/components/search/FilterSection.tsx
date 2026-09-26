import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Palette } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  title: string;
  children: ReactNode;
}

/** 絞りこみシートの1セクション(見出し＋中身) */
export function FilterSection({ title, children }: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    section: {
      gap: 6,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
      marginTop: 6,
    },
  });
