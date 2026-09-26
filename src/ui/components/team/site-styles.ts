import { StyleSheet } from 'react-native';

import { Palette, Spacing } from '@/ui/theme';

/** チーム公式サイトの各ページで共通して使うスタイル */
export const makeSiteStyles = (c: Palette) =>
  StyleSheet.create({
    // PC: コンテンツを中央1080pxに収める(ヘッダー・メニューも同じ幅)
    innerWide: {
      width: '100%',
      maxWidth: 1080,
      alignSelf: 'center',
    },
    body: {
      paddingHorizontal: Spacing.three,
      gap: Spacing.two,
    },
    bio: {
      fontSize: 13,
      lineHeight: 21,
      color: c.text,
    },
    emptyText: {
      fontSize: 12,
      color: c.textSecondary,
    },
    scheduleGroup: {
      fontSize: 13,
      fontWeight: '800',
      color: c.text,
      marginTop: Spacing.two,
    },
    newsDate: {
      width: 56,
      fontSize: 11,
      fontWeight: '800',
    },
    newsText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 18,
      color: c.text,
    },
  });
