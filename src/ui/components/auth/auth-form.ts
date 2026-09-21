import { StyleSheet } from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';

/**
 * ログイン・新規登録で共通の枠組み(画面・入力欄・送信ボタン・フッター)のスタイル。
 * 画面ごとに違う部分(ロゴ・利用形態の選択など)は各画面のスタイルに置く。
 */
export const makeAuthStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      padding: Spacing.four,
      gap: Spacing.two,
    },
    contentCentered: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    field: {
      gap: 5,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: 13,
      fontSize: 14,
      color: c.text,
    },
    error: {
      fontSize: 12,
      fontWeight: '600',
      color: Brand.danger,
    },
    primaryButton: {
      alignItems: 'center',
      backgroundColor: Brand.primary,
      borderRadius: 999,
      paddingVertical: 14,
      marginTop: Spacing.two,
    },
    disabled: {
      opacity: 0.4,
    },
    pressed: {
      opacity: 0.85,
    },
    primaryText: {
      fontSize: 15,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: Spacing.three,
    },
    footerText: {
      fontSize: 13,
      color: c.textSecondary,
    },
    footerLink: {
      fontSize: 13,
      fontWeight: '800',
      color: Brand.primary,
    },
  });
