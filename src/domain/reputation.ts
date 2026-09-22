import { getDaysBetween } from '@/lib/local-date';

import {
  BADGE_RULES,
  HALF_LIFE_DAYS,
  NEWCOMER_DAYS,
  PRIOR_ATTENDANCE_RATE,
  SHRINKAGE_WEIGHT,
  TEAM_ACTIVITY_SATURATION,
} from './discovery-config';
import { getLatestParticipations, type Participation } from './participation';

/**
 * 実績の計算（docs/DOMAIN.md 9.4 / 9.5）。
 *
 * 保存されたカウンタは使わず、参加記録の履歴から毎回計算する（9.1）。
 * 現在日（today）は引数で受け取り、関数の中で時計を読まない。
 */

/** ① 時間減衰の重み。当日が1、半減期ごとに半分 */
export function getDecayWeight(recordedAt: string, today: string): number {
  const elapsed = Math.max(0, getDaysBetween(recordedAt, today));
  return 0.5 ** (elapsed / HALF_LIFE_DAYS);
}

/** 登録から間もないか（③ 新規枠 / ⑤ バッジ） */
export function isNewcomer(registeredAt: string, today: string): boolean {
  return getDaysBetween(registeredAt, today) <= NEWCOMER_DAYS;
}

export interface UserReputation {
  /** ② 縮約した出席率（0〜1）。記録が無ければ全体平均 */
  attendanceRate: number;
  /** 減衰込みの記録の件数。出席率がどれだけ信頼できるかの目安 */
  weightedSample: number;
  /** 累計の出席回数。到達型バッジにだけ使う */
  totalAttended: number;
}

export function getUserReputation(
  userId: string,
  records: readonly Participation[],
  today: string,
): UserReputation {
  const own = getLatestParticipations(records).filter((r) => r.userId === userId);
  let weightedAttended = 0;
  let weightedSample = 0;
  for (const record of own) {
    const weight = getDecayWeight(record.recordedAt, today);
    weightedSample += weight;
    if (record.status === 'attended') weightedAttended += weight;
  }
  const attendanceRate =
    (weightedAttended + SHRINKAGE_WEIGHT * PRIOR_ATTENDANCE_RATE) /
    (weightedSample + SHRINKAGE_WEIGHT);
  return {
    attendanceRate,
    weightedSample,
    totalAttended: own.filter((r) => r.status === 'attended').length,
  };
}

export interface TeamReputation {
  /** 減衰込みの開催回数 */
  weightedEvents: number;
  /** 直近の開催があるか */
  activeRecently: boolean;
  /** 累計の開催回数。到達型バッジにだけ使う */
  totalEvents: number;
}

/**
 * チームの実績。
 * 出席の記録が1件でも付いた募集を「開催した」とみなす。
 */
export function getTeamReputation(
  teamId: string,
  records: readonly Participation[],
  today: string,
): TeamReputation {
  const held = new Map<string, string>();
  for (const record of getLatestParticipations(records)) {
    if (record.hostTeamId !== teamId || record.status !== 'attended') continue;
    const known = held.get(record.opportunityId);
    if (known === undefined || known < record.recordedAt) {
      held.set(record.opportunityId, record.recordedAt);
    }
  }
  const dates = [...held.values()];
  return {
    weightedEvents: dates.reduce((sum, d) => sum + getDecayWeight(d, today), 0),
    activeRecently: dates.some(
      (d) => getDaysBetween(d, today) <= BADGE_RULES.activeWithinDays,
    ),
    totalEvents: dates.length,
  };
}

/** 並び順に使う実績（0〜1）。チームは活動量を頭打ちにして比べる */
export function getTeamActivityScore(reputation: TeamReputation): number {
  return Math.min(1, reputation.weightedEvents / TEAM_ACTIVITY_SATURATION);
}
