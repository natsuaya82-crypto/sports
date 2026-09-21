import { z } from 'zod';

import { levelSchema } from './level';
import {
  getTimeOfDay,
  isOpen,
  opportunityKindSchema,
  timeOfDaySchema,
  type Opportunity,
} from './opportunity';
import { sportSchema } from './sport';

/** 費用の上限（円）。null は指定なし、0 は無料のみ */
export const FEE_OPTIONS = [
  { key: 'any', label: '指定なし', max: null },
  { key: 'free', label: '無料', max: 0 },
  { key: 'u1000', label: '〜¥1,000', max: 1000 },
  { key: 'u2000', label: '〜¥2,000', max: 2000 },
] as const;

export type FeeKey = (typeof FEE_OPTIONS)[number]['key'];

/** 距離の上限（km）。null は指定なし */
export const DISTANCE_OPTIONS = [
  { key: 'any', label: '指定なし', max: null },
  { key: 'd3', label: '3km', max: 3 },
  { key: 'd5', label: '5km', max: 5 },
  { key: 'd10', label: '10km', max: 10 },
] as const;

export type DistanceKey = (typeof DISTANCE_OPTIONS)[number]['key'];

/**
 * 時間帯の選択肢。
 * アイコンは表示の都合なのでui側が持つ（docs/ARCHITECTURE.md 第3章）。
 */
export const TIME_OPTIONS = [
  { key: 'morning', label: '朝' },
  { key: 'day', label: '昼' },
  { key: 'night', label: '夜' },
] as const;

export const opportunityFilterSchema = z.object({
  /** 空配列 = すべて */
  sports: z.array(sportSchema),
  kinds: z.array(opportunityKindSchema),
  levels: z.array(levelSchema),
  times: z.array(timeOfDaySchema),
  fee: z.enum(FEE_OPTIONS.map((o) => o.key) as unknown as [FeeKey, ...FeeKey[]]),
  distance: z.enum(
    DISTANCE_OPTIONS.map((o) => o.key) as unknown as [DistanceKey, ...DistanceKey[]],
  ),
  /** 締切・満員を除いて空きがある募集だけにする */
  openOnly: z.boolean(),
});

export type OpportunityFilter = z.infer<typeof opportunityFilterSchema>;

export const DEFAULT_FILTER: OpportunityFilter = {
  sports: [],
  kinds: [],
  levels: [],
  times: [],
  fee: 'any',
  distance: 'any',
  openOnly: false,
};

function getMaxFee(key: FeeKey): number | null {
  return FEE_OPTIONS.find((o) => o.key === key)?.max ?? null;
}

function getMaxDistance(key: DistanceKey): number | null {
  return DISTANCE_OPTIONS.find((o) => o.key === key)?.max ?? null;
}

/**
 * 1条件 = 1述語。条件が増えても1つの関数が肥大化しないように分けている。
 * 空配列・'any' は「指定なし」なので常に通す。
 */
const PREDICATES: ((o: Opportunity, f: OpportunityFilter) => boolean)[] = [
  (o, f) => f.sports.length === 0 || f.sports.includes(o.sport),
  (o, f) => f.kinds.length === 0 || f.kinds.includes(o.kind),
  (o, f) => f.levels.length === 0 || f.levels.includes(o.level),
  (o, f) => f.times.length === 0 || f.times.includes(getTimeOfDay(o)),
  (o, f) => {
    const max = getMaxFee(f.fee);
    return max === null || o.fee <= max;
  },
  (o, f) => {
    const max = getMaxDistance(f.distance);
    return max === null || o.distanceKm <= max;
  },
  (o, f) => !f.openOnly || isOpen(o),
];

/** フィルタを適用した募集一覧を返す */
export function filterOpportunities(
  opportunities: readonly Opportunity[],
  filter: OpportunityFilter,
): Opportunity[] {
  return opportunities.filter((o) => PREDICATES.every((p) => p(o, filter)));
}

/**
 * 有効な条件の数（絞りこみボタンのバッジ用）。
 * 競技は常設のプルダウン側なので数に含めない。
 */
export function countActiveFilters(filter: OpportunityFilter): number {
  const flags = [
    filter.kinds.length > 0,
    filter.levels.length > 0,
    filter.times.length > 0,
    filter.fee !== 'any',
    filter.distance !== 'any',
    filter.openOnly,
  ];
  return flags.filter(Boolean).length;
}
