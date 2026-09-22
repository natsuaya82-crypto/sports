/**
 * 発見（並び順）と実績の計算に使う値（docs/DOMAIN.md 9.5 / 9.6）。
 *
 * すべて**初期値**で、実際の利用データを見て調整する前提。
 * 画面側へ散らさず、ここ1箇所で変える。
 */

/** ① 時間減衰の半減期（日）。90日前の実績は今日の半分の重みになる */
export const HALF_LIFE_DAYS = 90;

/** ② 出席率の縮約: 全体平均へ引き戻す強さ（記録何件分に相当するか） */
export const SHRINKAGE_WEIGHT = 3;

/** ② 出席率の縮約: 記録が無い人を置く全体平均 */
export const PRIOR_ATTENDANCE_RATE = 0.85;

/** ③ 新規とみなす期間（日） */
export const NEWCOMER_DAYS = 30;

/** ③ 新規枠を差し込む間隔。先頭からこの件数ごとに1件 */
export const NEWCOMER_INTERVAL = 4;

/** ④ マッチ度の各要素の重み（合計1） */
export const MATCH_WEIGHTS = {
  sport: 0.4,
  level: 0.3,
  area: 0.2,
  kind: 0.1,
} as const;

/** チームの活動量がこの件数（減衰込み）で頭打ちになる */
export const TEAM_ACTIVITY_SATURATION = 5;

/** ⑤ バッジの条件 */
export const BADGE_RULES = {
  /** 出席率バッジに必要な記録の件数（減衰込み） */
  reliableMinSample: 3,
  /** 出席率バッジの下限 */
  reliableMinRate: 0.9,
  /** 参加回数バッジ */
  veteranAttended: 10,
  /** 活動中とみなす期間（日） */
  activeWithinDays: 30,
  /** 開催回数バッジ */
  experiencedHostEvents: 10,
} as const;
