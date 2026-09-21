import { StyleSheet } from 'react-native';

import type { Team } from '@/domain/team';
import { Brand, Palette, Spacing } from '@/ui/theme';

/** 各セクションのフォームが受け取る値。保存はチーム全体の部分更新で表す */
export interface TeamEditFormProps {
  team: Team;
  onSave: (patch: Partial<Omit<Team, 'id'>>) => void;
}

/** フォームの骨格・追加リスト・保存バーのスタイル */
export const makeEditFormStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
      padding: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 120,
    },
    sectionHint: {
      fontSize: 11,
      lineHeight: 17,
      color: c.textSecondary,
    },
    addRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      alignItems: 'center',
    },
    addInput: {
      flex: 1,
    },
    addButton: {
      backgroundColor: Brand.primary,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: 10,
    },
    addButtonDisabled: {
      opacity: 0.4,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.onPrimary,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
    },
    listRowDate: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    listRowText: {
      flex: 1,
      fontSize: 12,
      color: c.text,
    },
    saveBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      backgroundColor: c.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    saveButton: {
      alignItems: 'center',
      borderRadius: 999,
      paddingVertical: 14,
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    savePressed: {
      opacity: 0.85,
    },
    saveText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#ffffff',
    },
  });

/** 入力欄・選択チップのスタイル */
export const makeEditFieldStyles = (c: Palette) =>
  StyleSheet.create({
    field: {
      gap: 5,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    fieldHalf: {
      flex: 1,
    },
    fieldLabelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: Spacing.two,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    fieldHint: {
      fontSize: 10,
      color: c.textSecondary,
    },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
      fontSize: 13,
      color: c.text,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
    },
  });
