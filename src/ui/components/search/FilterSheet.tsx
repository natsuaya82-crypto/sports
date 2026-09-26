import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { FilterChip, FilterChipRow } from '@/ui/components/search/FilterChip';
import { FilterKindSection } from '@/ui/components/search/FilterKindSection';
import { FilterSection } from '@/ui/components/search/FilterSection';
import { Segmented } from '@/ui/components/search/Segmented';
import { BottomSheet } from '@/ui/components/sheet/BottomSheet';
import { SheetFooterActions } from '@/ui/components/sheet/SheetFooterActions';
import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
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
    <BottomSheet
      visible={visible}
      title="絞りこみ"
      onClose={onClose}
      maxHeight="85%"
      footer={
        <SheetFooterActions
          onReset={() => setDraft((d) => ({ ...DEFAULT_FILTER, sports: d.sports }))}
          applyLabel={`${resultCount}件を表示`}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      }>
      {/* スクロールなしで収まるコンパクト構成 */}
      <View style={styles.content}>
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
    </BottomSheet>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    content: {
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
  });
