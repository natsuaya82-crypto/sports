import { MATCH_WEIGHTS, NEWCOMER_INTERVAL } from './discovery-config';
import { LEVELS, type Level } from './level';
import type { OpportunityKind } from './opportunity';
import type { Participation } from './participation';
import type { Prefecture } from './prefecture';
import {
  getTeamActivityScore,
  getTeamReputation,
  getUserReputation,
  isNewcomer,
} from './reputation';
import type { Sport } from './sport';
import type { Team } from './team';
import type { User } from './user';

/**
 * 発見のための並び順（docs/DOMAIN.md 9.4 / 9.5）。
 *
 * 総合順位ではなく「見ている人との相性（④マッチ度）」を主にし、
 * 実績（①②）は補助に留め、新規（③）には一定の枠を確保する。
 */

/** 相性を測る側（見ている人）の条件 */
export interface MatchCriteria {
  /** 空なら競技で差を付けない */
  sports: readonly Sport[];
  level: Level;
  prefecture: Prefecture;
  ward: string;
  /** 空なら参加形態で差を付けない */
  kinds: readonly OpportunityKind[];
}

/** 相性を測られる側 */
export interface MatchTarget {
  sports: readonly Sport[];
  level: Level;
  prefecture: Prefecture;
  ward: string;
  kinds: readonly OpportunityKind[];
}

function overlaps<T>(a: readonly T[], b: readonly T[]): boolean {
  return a.some((x) => b.includes(x));
}

function getLevelScore(a: Level, b: Level): number {
  const gap = Math.abs(LEVELS.indexOf(a) - LEVELS.indexOf(b));
  return 0.5 ** gap;
}

function getAreaScore(target: MatchTarget, criteria: MatchCriteria): number {
  if (target.prefecture !== criteria.prefecture) return 0;
  return target.ward === criteria.ward ? 1 : 0.5;
}

/** ④ マッチ度（0〜1） */
export function getMatchScore(target: MatchTarget, criteria: MatchCriteria): number {
  const sport =
    criteria.sports.length === 0 || overlaps(target.sports, criteria.sports) ? 1 : 0;
  const kind =
    criteria.kinds.length === 0 || overlaps(target.kinds, criteria.kinds) ? 1 : 0;
  return (
    MATCH_WEIGHTS.sport * sport +
    MATCH_WEIGHTS.level * getLevelScore(target.level, criteria.level) +
    MATCH_WEIGHTS.area * getAreaScore(target, criteria) +
    MATCH_WEIGHTS.kind * kind
  );
}

/** 見ている人のプロフィールから相性の条件を作る */
export function getCriteriaFromUser(user: User): MatchCriteria {
  return {
    sports: user.sports,
    level: user.level,
    prefecture: user.prefecture,
    ward: user.ward,
    kinds: user.wantedKinds ?? [],
  };
}

function getTeamAsTarget(team: Team): MatchTarget {
  return {
    sports: [team.sport],
    level: team.level,
    prefecture: team.prefecture,
    ward: team.ward,
    kinds: team.recruitingKinds,
  };
}

function getUserAsTarget(user: User): MatchTarget {
  return {
    sports: user.sports,
    level: user.level,
    prefecture: user.prefecture,
    ward: user.ward,
    kinds: user.wantedKinds ?? [],
  };
}

/**
 * ③ 新規枠。
 *
 * 新規が interval 件のあいだ1件も出てこなければ、残っている新規のうち
 * 最上位のものを繰り上げる。**下限の保証であって上限ではない**ので、
 * 相性が良くて元から上位にいる新規を後ろへ下げることはない。
 */
export function interleaveNewcomers<T>(
  ranked: readonly T[],
  isNew: (item: T) => boolean,
  interval: number = NEWCOMER_INTERVAL,
): T[] {
  const remaining = [...ranked];
  const result: T[] = [];
  let sinceNewcomer = 0;
  while (remaining.length > 0) {
    const due = sinceNewcomer >= interval - 1;
    const newcomerIndex = due ? remaining.findIndex(isNew) : -1;
    const [next] = remaining.splice(Math.max(0, newcomerIndex), 1);
    result.push(next);
    sinceNewcomer = isNew(next) ? 0 : sinceNewcomer + 1;
  }
  return result;
}

interface Scored<T> {
  item: T;
  match: number;
  reputation: number;
}

/**
 * マッチ度が同じかどうかの許容差。
 * マッチ度は重みの組み合わせで決まる飛び飛びの値なので、浮動小数の誤差だけを吸収する。
 */
const MATCH_EPSILON = 1e-9;

/**
 * マッチ度の高い順。**マッチ度が同じときだけ**実績の高い順（9.5）。
 *
 * 足し算で混ぜると、実績の大きい遠くのチームが、条件ぴったりの新しいチームに
 * 勝ってしまう。実績は同点の順位付けにだけ効かせる。
 */
function compareScored<T>(a: Scored<T>, b: Scored<T>): number {
  if (Math.abs(a.match - b.match) > MATCH_EPSILON) return b.match - a.match;
  return b.reputation - a.reputation;
}

function rank<T>(
  items: readonly T[],
  score: (item: T) => { match: number; reputation: number },
  isNew: (item: T) => boolean,
): T[] {
  const sorted = items
    .map((item) => ({ item, ...score(item) }))
    .sort(compareScored)
    .map((s) => s.item);
  return interleaveNewcomers(sorted, isNew);
}

export interface DiscoveryContext {
  criteria: MatchCriteria;
  records: readonly Participation[];
  today: string;
}

/** チーム検索の並び順 */
export function rankTeams(teams: readonly Team[], context: DiscoveryContext): Team[] {
  const { criteria, records, today } = context;
  return rank(
    teams,
    (team) => ({
      match: getMatchScore(getTeamAsTarget(team), criteria),
      reputation: getTeamActivityScore(getTeamReputation(team.id, records, today)),
    }),
    (team) => isNewcomer(team.registeredAt, today),
  );
}

/** スカウト候補の並び順 */
export function rankUsers(users: readonly User[], context: DiscoveryContext): User[] {
  const { criteria, records, today } = context;
  return rank(
    users,
    (user) => ({
      match: getMatchScore(getUserAsTarget(user), criteria),
      reputation: getUserReputation(user.id, records, today).attendanceRate,
    }),
    (user) => isNewcomer(user.registeredAt, today),
  );
}
