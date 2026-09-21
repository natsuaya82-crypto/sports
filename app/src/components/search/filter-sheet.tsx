import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import {
  Brand,
  LevelColors,
  MaxPhoneWidth,
  Palette,
  RecruitmentTypeColors,
  Spacing,
} from '@/constants/theme';
import { useThemedStyles } from '@/contexts/theme-context';
import {
  Level,
  LevelLabels,
  Recruitment,
  RecruitmentType,
  RecruitmentTypeLabels,
  remainingSlots,
  Sport,
} from '@/types/recruitment';

/** 費用の上限(円)。null は指定なし、0 は無料のみ */
const FEE_OPTIONS = [
  { key: 'any', label: '指定なし', max: null },
  { key: 'free', label: '無料', max: 0 },
  { key: 'u1000', label: '〜¥1,000', max: 1000 },
  { key: 'u2000', label: '〜¥2,000', max: 2000 },
] as const;
type FeeKey = (typeof FEE_OPTIONS)[number]['key'];

/** 距離の上限(km)。null は指定なし */
const DISTANCE_OPTIONS = [
  { key: 'any', label: '指定なし', max: null },
  { key: 'd3', label: '3km', max: 3 },
  { key: 'd5', label: '5km', max: 5 },
  { key: 'd10', label: '10km', max: 10 },
] as const;
type DistanceKey = (typeof DISTANCE_OPTIONS)[number]['key'];

/** 開始時刻ベースの時間帯 */
const TIME_OPTIONS: {
  key: 'morning' | 'day' | 'night';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'morning', label: '朝', icon: 'sunny-outline' },
  { key: 'day', label: '昼', icon: 'partly-sunny-outline' },
  { key: 'night', label: '夜', icon: 'moon-outline' },
];
type TimeKey = (typeof TIME_OPTIONS)[number]['key'];

/** 募集タイプの説明(選択カードに出す) */
const TYPE_DESCRIPTIONS: Record<RecruitmentType, string> = {
  helper: 'その日だけ助っ人参加',
  member: 'チームに正式加入',
  match: 'チーム同士の対戦',
  trial: 'まずは体験から',
};

export interface RecruitmentFilter {
  /** 空配列 = すべて(競技チップから設定される) */
  sports: Sport[];
  types: RecruitmentType[];
  levels: Level[];
  times: TimeKey[];
  fee: FeeKey;
  distance: DistanceKey;
  /** 締切・満員を除いて空きがある募集だけにする */
  openOnly: boolean;
}

export const DEFAULT_FILTER: RecruitmentFilter = {
  sports: [],
  types: [],
  levels: [],
  times: [],
  fee: 'any',
  distance: 'any',
  openOnly: false,
};

function timeOfDay(startTime: string): TimeKey {
  const hour = Number(startTime.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'day';
  return 'night';
}

/** フィルタを適用した募集一覧を返す */
export function applyFilter(items: Recruitment[], f: RecruitmentFilter): Recruitment[] {
  const feeMax = FEE_OPTIONS.find((o) => o.key === f.fee)?.max ?? null;
  const distanceMax = DISTANCE_OPTIONS.find((o) => o.key === f.distance)?.max ?? null;

  return items.filter((r) => {
    if (f.sports.length > 0 && !f.sports.includes(r.sport)) return false;
    if (f.types.length > 0 && !f.types.includes(r.type)) return false;
    if (f.levels.length > 0 && !f.levels.includes(r.level)) return false;
    if (f.times.length > 0 && !f.times.includes(timeOfDay(r.startTime))) return false;
    if (feeMax !== null && r.fee > feeMax) return false;
    if (distanceMax !== null && r.distanceKm > distanceMax) return false;
    if (f.openOnly && (r.closed || remainingSlots(r) === 0)) return false;
    return true;
  });
}

/** シート内で有効な条件の数(絞りこみボタンのバッジ用。競技は常設チップ側なので含めない) */
export function countActiveFilters(f: RecruitmentFilter): number {
  let count = 0;
  if (f.types.length > 0) count += 1;
  if (f.levels.length > 0) count += 1;
  if (f.times.length > 0) count += 1;
  if (f.fee !== 'any') count += 1;
  if (f.distance !== 'any') count += 1;
  if (f.openOnly) count += 1;
  return count;
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

interface Props {
  visible: boolean;
  /** 開いた時点の適用済みフィルタ */
  filter: RecruitmentFilter;
  /** 件数プレビュー用: 日付で絞った後の募集一覧 */
  candidates: Recruitment[];
  onClose: () => void;
  onApply: (filter: RecruitmentFilter) => void;
}

/** 絞りこみボトムシート */
export function FilterSheet({ visible, filter, candidates, onClose, onApply }: Props) {
  const styles = useThemedStyles(makeStyles);
  const [draft, setDraft] = useState(filter);

  // 開くたびに適用済みの状態から編集を始める
  useEffect(() => {
    if (visible) setDraft(filter);
  }, [visible, filter]);

  const resultCount = applyFilter(candidates, draft).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>絞りこみ</Text>

          {/* スクロールなしで収まるコンパクト構成 */}
          <View style={styles.scrollContent}>
            {/* 募集タイプ: 説明付きの選択カード */}
            <Text style={styles.sectionTitle}>募集タイプ</Text>
            <View style={styles.typeGrid}>
              {(Object.keys(RecruitmentTypeLabels) as RecruitmentType[]).map((type) => {
                const selected = draft.types.includes(type);
                const color = RecruitmentTypeColors[type];
                return (
                  <Pressable
                    key={type}
                    onPress={() =>
                      setDraft((d) => ({ ...d, types: toggleValue(d.types, type) }))
                    }
                    style={[
                      styles.typeCard,
                      selected && { borderColor: color, backgroundColor: `${color}14` },
                    ]}>
                    <View style={styles.typeCardHead}>
                      <View style={[styles.typeDot, { backgroundColor: color }]} />
                      <Text style={styles.typeCardLabel}>
                        {RecruitmentTypeLabels[type]}
                      </Text>
                      {selected && (
                        <Ionicons name="checkmark-circle" size={16} color={color} />
                      )}
                    </View>
                    <Text style={styles.typeCardDesc}>{TYPE_DESCRIPTIONS[type]}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* レベル */}
            <Text style={styles.sectionTitle}>レベル</Text>
            <View style={styles.chipRow}>
              {(Object.keys(LevelLabels) as Level[]).map((level) => {
                const selected = draft.levels.includes(level);
                return (
                  <Pressable
                    key={level}
                    onPress={() =>
                      setDraft((d) => ({ ...d, levels: toggleValue(d.levels, level) }))
                    }
                    style={[
                      styles.chip,
                      selected && { backgroundColor: LevelColors[level] },
                    ]}>
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {LevelLabels[level]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 時間帯 */}
            <Text style={styles.sectionTitle}>時間帯</Text>
            <View style={styles.chipRow}>
              {TIME_OPTIONS.map((o) => {
                const selected = draft.times.includes(o.key);
                return (
                  <Pressable
                    key={o.key}
                    onPress={() =>
                      setDraft((d) => ({ ...d, times: toggleValue(d.times, o.key) }))
                    }
                    style={[styles.chip, styles.timeChip, selected && styles.chipPrimary]}>
                    <Ionicons
                      name={o.icon}
                      size={14}
                      color={selected ? Brand.onPrimary : styles.chipText.color}
                    />
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* 参加費 */}
            <Text style={styles.sectionTitle}>参加費</Text>
            <Segmented
              options={FEE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
              selected={draft.fee}
              onSelect={(key) => setDraft((d) => ({ ...d, fee: key as FeeKey }))}
            />

            {/* 距離 */}
            <Text style={styles.sectionTitle}>距離</Text>
            <Segmented
              options={DISTANCE_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
              selected={draft.distance}
              onSelect={(key) => setDraft((d) => ({ ...d, distance: key as DistanceKey }))}
            />

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

/** 単一選択のセグメント */
function Segmented({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const isSelected = o.key === selected;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            style={[styles.segment, isSelected && styles.segmentSelected]}>
            <Text
              style={[styles.segmentText, isSelected && styles.segmentTextSelected]}
              numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
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
    sectionTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
      marginTop: 6,
    },
    // 募集タイプの2×2カード
    typeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    typeCard: {
      width: '48%',
      flexGrow: 1,
      borderWidth: 1.5,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
      gap: 3,
    },
    typeCardHead: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    typeDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    typeCardLabel: {
      flex: 1,
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    typeCardDesc: {
      fontSize: 10,
      color: c.textSecondary,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 15,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    chipPrimary: {
      backgroundColor: Brand.primary,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
      fontWeight: '700',
    },
    segmented: {
      flexDirection: 'row',
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      padding: 3,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 8,
    },
    segmentSelected: {
      backgroundColor: Brand.primary,
    },
    segmentText: {
      fontSize: 11,
      fontWeight: '600',
      color: c.text,
    },
    segmentTextSelected: {
      color: Brand.onPrimary,
      fontWeight: '700',
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
