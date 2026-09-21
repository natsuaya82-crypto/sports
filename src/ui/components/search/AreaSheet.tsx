import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/ui/components/sheet/BottomSheet';
import { SheetFooterActions } from '@/ui/components/sheet/SheetFooterActions';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { AreaSelection, DEFAULT_AREA, getAreaLabel } from '@/domain/area';
import { REGIONS, getShortPrefectureName, type Prefecture } from '@/domain/prefecture';

function togglePrefecture(list: Prefecture[], value: Prefecture): Prefecture[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface Props {
  visible: boolean;
  /** 開いた時点の適用済みエリア */
  area: AreaSelection;
  onClose: () => void;
  onApply: (area: AreaSelection) => void;
}

/** エリア選択ボトムシート(都道府県のみ・複数選択可) */
export function AreaSheet({ visible, area, onClose, onApply }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState(area);

  // 開くたびに適用済みの状態から編集を始める
  useEffect(() => {
    if (visible) setDraft(area);
  }, [visible, area]);

  return (
    <BottomSheet
      visible={visible}
      title="エリアを選ぶ"
      onClose={onClose}
      maxHeight="85%"
      footer={
        <SheetFooterActions
          onReset={() => setDraft(DEFAULT_AREA)}
          applyLabel={`${getAreaLabel(draft)}で決定`}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>都道府県(複数選択可)</Text>
          <Text style={styles.sectionHint}>未選択ですべてのエリア</Text>
        </View>
        {REGIONS.map((region) => (
          <View key={region.label} style={styles.section}>
            <Text style={styles.regionLabel}>{region.label}</Text>
            <View style={styles.chipRow}>
              {region.prefectures.map((pref) => {
                const selected = draft.prefectures.includes(pref);
                return (
                  <Pressable
                    key={pref}
                    onPress={() =>
                      setDraft((d) => ({
                        prefectures: togglePrefecture(d.prefectures, pref),
                      }))
                    }
                    style={[styles.chip, selected && styles.chipSelected]}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {getShortPrefectureName(pref)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
        <Text style={styles.note}>一覧は現在地から近い順で表示されます</Text>
      </ScrollView>
    </BottomSheet>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 0,
    },
    scrollContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.three,
      gap: Spacing.three,
    },
    section: {
      gap: Spacing.two,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: Spacing.two,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    regionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    sectionHint: {
      fontSize: 11,
      color: c.textSecondary,
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
    chipSelected: {
      backgroundColor: Brand.primary,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
    },
    note: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
