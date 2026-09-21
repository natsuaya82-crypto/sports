/** 種目 */
export type Sport =
  | 'soccer'
  | 'futsal'
  | 'baseball'
  | 'basketball'
  | 'volleyball'
  | 'running';

export const SportLabels: Record<Sport, string> = {
  soccer: 'サッカー',
  futsal: 'フットサル',
  baseball: '野球',
  basketball: 'バスケ',
  volleyball: 'バレー',
  running: '陸上',
};

/** 募集の種別 */
export type RecruitmentType = 'helper' | 'member' | 'match' | 'trial';

export const RecruitmentTypeLabels: Record<RecruitmentType, string> = {
  helper: '助っ人募集',
  member: 'メンバー募集',
  match: '対戦相手募集',
  trial: '体験参加OK',
};

/** レベル感 */
export type Level = 'enjoy' | 'middle' | 'serious';

export const LevelLabels: Record<Level, string> = {
  enjoy: 'エンジョイ',
  middle: 'ミドル',
  serious: 'ガチ',
};

/** 募集枠(カード1枚分) */
export interface Recruitment {
  id: string;
  sport: Sport;
  type: RecruitmentType;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  startTime: string;
  endTime: string;
  venueName: string;
  /** 都道府県(エリア絞りこみの判定に使う) */
  prefecture: string;
  /** 市区町村 */
  ward: string;
  distanceKm: number;
  /** 参加費(円)。0なら無料 */
  fee: number;
  level: Level;
  /** 募集人数 */
  capacity: number;
  /** 埋まった人数 */
  filled: number;
  teamName: string;
  photo: string;
  closed?: boolean;
}

/** 残り枠数 */
export function remainingSlots(r: Recruitment): number {
  return Math.max(0, r.capacity - r.filled);
}
