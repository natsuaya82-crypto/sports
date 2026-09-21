import { z } from 'zod';

import { levelSchema } from './level';
import { locationSchema } from './location';
import { sportSchema } from './sport';

/**
 * 募集・参加機会の種類（docs/DOMAIN.md 第2章）。
 *
 * 種類が増えても独立したモデル一式を作らない。共通の Opportunity を骨格にし、
 * 種類固有の構造化属性が実際に必要になった時点でのみ差分を足す。
 */
export const opportunityKindSchema = z.enum([
  'individual_join',
  'team_member',
  'practice',
  'selection',
  'friendly_match',
  'tournament',
  'event',
]);

export type OpportunityKind = z.infer<typeof opportunityKindSchema>;

/**
 * 表示名。
 *
 * individual_join / team_member / practice / friendly_match の文言はprototypeの
 * 助っ人募集 / メンバー募集 / 体験参加OK / 対戦相手募集 をそのまま引き継ぐ。
 * 残り3種はdocs/DOMAIN.md 第2章の表記に合わせている。
 */
const OPPORTUNITY_KIND_LABELS: Record<OpportunityKind, string> = {
  individual_join: '助っ人募集',
  team_member: 'メンバー募集',
  practice: '体験参加OK',
  selection: 'セレクション',
  friendly_match: '対戦相手募集',
  tournament: '大会',
  event: 'イベント',
};

const OPPORTUNITY_KIND_DESCRIPTIONS: Record<OpportunityKind, string> = {
  individual_join: 'その日だけ助っ人参加',
  team_member: 'チームに正式加入',
  practice: 'まずは体験から',
  selection: '加入前の選考',
  friendly_match: 'チーム同士の対戦',
  tournament: '勝ち上がり形式の大会',
  event: '交流・体験イベント',
};

export function getOpportunityKindLabel(kind: OpportunityKind): string {
  return OPPORTUNITY_KIND_LABELS[kind];
}

export function getOpportunityKindDescription(kind: OpportunityKind): string {
  return OPPORTUNITY_KIND_DESCRIPTIONS[kind];
}

/**
 * いま画面で扱う募集の種類。
 *
 * モデルとしては7種類を持つが、UI prototypeが画面を持っているのはこの4つだけ。
 * 残りの selection / tournament / event を画面へ出すかはユーザーが決めること
 * なので、AIが勝手に増やさない（CLAUDE.md 第7章）。
 *
 * 並びはprototypeの RecruitmentTypeLabels と同じ。
 * 絞りこみ・募集作成・チームの募集設定がこの一覧を共有する。
 */
export const SUPPORTED_OPPORTUNITY_KINDS: readonly OpportunityKind[] = [
  'individual_join',
  'team_member',
  'friendly_match',
  'practice',
];

const opportunityStatusSchema = z.enum(['open', 'closed']);


/** ローカル日時。`YYYY-MM-DDTHH:mm` */
const localDateTimeSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);

export const opportunitySchema = z.object({
  id: z.string(),
  kind: opportunityKindSchema,
  sport: sportSchema,
  title: z.string().min(1),
  /**
   * 開始・終了日時。
   * 日程が決まっていない常設募集（チームのメンバー募集など）は null になる。
   * 日付軸の一覧には日時を持つものだけが並ぶ。
   */
  startsAt: localDateTimeSchema.nullable(),
  endsAt: localDateTimeSchema.nullable(),
  location: locationSchema,
  /** 閲覧者から会場までの距離。モック段階の固定値で、位置情報の導入時に算出へ置き換える */
  distanceKm: z.number().min(0),
  /** 参加費（円）。0なら無料 */
  fee: z.number().int().min(0),
  level: levelSchema,
  capacity: z.number().int().positive(),
  /**
   * 埋まった人数。
   * docs/DOMAIN.md 第4章では accepted な Application の件数が参加の実体になる。
   * モック段階では集計元が無いため値を持つ。Supabase導入時に集計へ置き換える。
   */
  filledCount: z.number().int().min(0),
  /** 主催は常にUser。Teamとして主催する場合のみ hostTeamId が入る（docs/DOMAIN.md 第2章） */
  hostUserId: z.string(),
  hostTeamId: z.string().nullable(),
  /** 主催チームの表示名。hostTeamId がTeamとして登録済みなら Team.name と一致する */
  hostTeamName: z.string(),
  photo: z.string(),
  status: opportunityStatusSchema,
});

export type Opportunity = z.infer<typeof opportunitySchema>;

/** 残り枠数 */
export function getRemainingCapacity(opportunity: Opportunity): number {
  return Math.max(0, opportunity.capacity - opportunity.filledCount);
}

export function isFull(opportunity: Opportunity): boolean {
  return getRemainingCapacity(opportunity) === 0;
}

/** 締切・満員でなく、まだ応募を受け付けている状態か */
export function isOpen(opportunity: Opportunity): boolean {
  return opportunity.status === 'open' && !isFull(opportunity);
}

/** 日程が決まっているか。常設募集は false */
export function isScheduled(
  opportunity: Opportunity,
): opportunity is Opportunity & { startsAt: string; endsAt: string } {
  return opportunity.startsAt !== null && opportunity.endsAt !== null;
}

/** 開催日（`YYYY-MM-DD`）。常設募集は null */
export function getOpportunityDate(opportunity: Opportunity): string | null {
  return opportunity.startsAt?.slice(0, 10) ?? null;
}

/** 開始時刻（`HH:mm`）。常設募集は null */
export function getStartTime(opportunity: Opportunity): string | null {
  return opportunity.startsAt?.slice(11, 16) ?? null;
}

/** 終了時刻（`HH:mm`）。常設募集は null */
export function getEndTime(opportunity: Opportunity): string | null {
  return opportunity.endsAt?.slice(11, 16) ?? null;
}

/** 開始時刻ベースの時間帯 */
export type TimeOfDay = 'morning' | 'day' | 'night';

export function getTimeOfDay(opportunity: Opportunity): TimeOfDay | null {
  const startTime = getStartTime(opportunity);
  if (startTime === null) return null;
  const hour = Number(startTime.slice(0, 2));
  if (hour < 12) return 'morning';
  if (hour < 17) return 'day';
  return 'night';
}

/**
 * 開催日の昇順。日程が決まっていない常設募集は日付を持たないため末尾へ置く。
 */
export function compareByStartDate(a: Opportunity, b: Opportunity): number {
  const dateA = getOpportunityDate(a);
  const dateB = getOpportunityDate(b);
  if (dateA === null) return dateB === null ? 0 : 1;
  if (dateB === null) return -1;
  return dateA.localeCompare(dateB);
}

/** 指定したチームが主催する募集 */
export function getOpportunitiesForTeam(
  opportunities: readonly Opportunity[],
  teamId: string,
): Opportunity[] {
  return opportunities.filter((o) => o.hostTeamId === teamId);
}
