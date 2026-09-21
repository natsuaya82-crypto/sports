import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Brand, MaxPhoneWidth, Palette, Spacing } from '@/ui/theme';
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>エリアを選ぶ</Text>

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
                        <Text
                          style={[
                            styles.chipText,
                            selected && styles.chipTextSelected,
                          ]}>
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

          <View style={styles.footer}>
            <Pressable
              onPress={() => setDraft(DEFAULT_AREA)}
              style={({ pressed }) => [styles.resetButton, pressed && styles.pressed]}>
              <Text style={styles.resetText}>リセット</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                onApply(draft);
                onClose();
              }}
              style={({ pressed }) => [
                styles.applyButton,
                pressed && styles.applyPressed,
              ]}>
              <Text style={styles.applyText}>{getAreaLabel(draft)}で決定</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetWrap: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    sheet: {
      width: '100%',
      maxWidth: MaxPhoneWidth,
      maxHeight: '85%',
      backgroundColor: c.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: Spacing.two,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.backgroundSelected,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
      paddingVertical: Spacing.two,
    },
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
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.four,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    resetButton: {
      paddingHorizontal: Spacing.three,
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: c.backgroundElement,
    },
    pressed: {
      opacity: 0.7,
    },
    resetText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    applyButton: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
      borderRadius: 999,
      backgroundColor: Brand.primary,
    },
    applyPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    applyText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
  });
