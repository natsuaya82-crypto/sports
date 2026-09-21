import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { FilterChip, FilterChipRow } from '@/ui/components/search/FilterChip';
import { FilterKindSection } from '@/ui/components/search/FilterKindSection';
import { FilterSection } from '@/ui/components/search/FilterSection';
import { Segmented } from '@/ui/components/search/Segmented';
import { Brand, LevelColors, MaxPhoneWidth, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { LEVELS, getLevelLabel } from '@/domain/level';
import { Opportunity, TimeOfDay } from '@/domain/opportunity';
import {
  DEFAULT_FILTER,
  DISTANCE_OPTIONS,
  FEE_OPTIONS,
  OpportunityFilter,
  TIME_OPTIONS,
  filterOpportunities,
} from '@/domain/opportunity-filter';

/** 時間帯のアイコン。選択肢そのものはdomainが持つ（アイコンは表示の都合） */
const TIME_ICONS: Record<TimeOfDay, keyof typeof Ionicons.glyphMap> = {
  morning: 'sunny-outline',
  day: 'partly-sunny-outline',
  night: 'moon-outline',
};

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface Props {
  visible: boolean;
  /** 開いた時点の適用済みフィルタ */
  filter: OpportunityFilter;
  /** 件数プレビュー用: 日付で絞った後の募集一覧 */
  candidates: Opportunity[];
  onClose: () => void;
  onApply: (filter: OpportunityFilter) => void;
}

/** 絞りこみボトムシート */
export function FilterSheet({ visible, filter, candidates, onClose, onApply }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState(filter);

  // 開くたびに適用済みの状態から編集を始める
  useEffect(() => {
    if (visible) setDraft(filter);
  }, [visible, filter]);

  const resultCount = filterOpportunities(candidates, draft).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>絞りこみ</Text>

          {/* スクロールなしで収まるコンパクト構成 */}
          <View style={styles.scrollContent}>
            <FilterSection title="募集タイプ">
              <FilterKindSection
                selected={draft.kinds}
                onToggle={(kind) =>
                  setDraft((d) => ({ ...d, kinds: toggleValue(d.kinds, kind) }))
                }
              />
            </FilterSection>

            <FilterSection title="レベル">
              <FilterChipRow>
                {LEVELS.map((level) => (
                  <FilterChip
                    key={level}
                    label={getLevelLabel(level)}
                    selected={draft.levels.includes(level)}
                    selectedColor={LevelColors[level]}
                    onPress={() =>
                      setDraft((d) => ({ ...d, levels: toggleValue(d.levels, level) }))
                    }
                  />
                ))}
              </FilterChipRow>
            </FilterSection>

            <FilterSection title="時間帯">
              <FilterChipRow>
                {TIME_OPTIONS.map((o) => (
                  <FilterChip
                    key={o.key}
                    label={o.label}
                    icon={TIME_ICONS[o.key]}
                    selected={draft.times.includes(o.key)}
                    onPress={() =>
                      setDraft((d) => ({ ...d, times: toggleValue(d.times, o.key) }))
                    }
                  />
                ))}
              </FilterChipRow>
            </FilterSection>

            <FilterSection title="参加費">
              <Segmented
                options={FEE_OPTIONS}
                selected={draft.fee}
                onSelect={(fee) => setDraft((d) => ({ ...d, fee }))}
              />
            </FilterSection>

            <FilterSection title="距離">
              <Segmented
                options={DISTANCE_OPTIONS}
                selected={draft.distance}
                onSelect={(distance) => setDraft((d) => ({ ...d, distance }))}
              />
            </FilterSection>

            {/* 空きのみ */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>空きがある募集のみ</Text>
              <Switch
                value={draft.openOnly}
                onValueChange={(v) => setDraft((d) => ({ ...d, openOnly: v }))}
                trackColor={{ true: Brand.primary }}
                thumbColor="#ffffff"
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={() => setDraft((d) => ({ ...DEFAULT_FILTER, sports: d.sports }))}
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
              <Text style={styles.applyText}>{resultCount}件を表示</Text>
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
    scrollContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.two,
      gap: 6,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    switchLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
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
