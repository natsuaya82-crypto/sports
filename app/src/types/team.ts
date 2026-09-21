import type { Level, RecruitmentType, Sport } from '@/types/recruitment';

/** チームのお知らせ(公式サイトのNEWS欄) */
export interface TeamNews {
  /** YYYY-MM-DD */
  date: string;
  text: string;
}

/** 試合(公式サイトの日程・結果欄) */
export interface TeamMatch {
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time?: string;
  opponent: string;
  venue?: string;
  /** 大会名・節(例: 'リーグ戦 第9節') */
  competition?: string;
  /** 終了した試合のスコア。未設定なら予定扱い */
  result?: { our: number; their: number };
}

/** メンバー(公式サイトのメンバー紹介欄) */
export interface TeamMember {
  name: string;
  /** 背番号 */
  number?: number;
  position?: string;
  /** 代表・キャプテンなどの肩書き */
  role?: string;
}

/**
 * 団体(公式サイトの元データ)。
 * 活動日が未定・場所が固定でない・人数非公開のチームも普通にあるので、
 * 決まっていない情報は任意項目にして「あるものだけ表示」する。
 */
export interface Team {
  id: string;
  name: string;
  sport: Sport;
  /** 主な活動エリア(市区町村)。これだけは必須 */
  ward: string;
  level: Level;
  /** いま募集している種別。空なら募集なし */
  recruiting: RecruitmentType[];
  photo: string;
  bio: string;
  /** サイトヒーローに出すキャッチコピー */
  tagline: string;
  /** チームカラー(サイトのアクセント色。カスタマイズの起点) */
  color: string;
  /** 活動写真(ギャラリー) */
  gallery: string[];

  /** ホームグラウンド。固定の場所がないチームは未設定 */
  homeGround?: string;
  /** 活動曜日・時間帯。不定期なチームは未設定 */
  schedule?: string;
  /** メンバー数。非公開・流動的なら未設定 */
  memberCount?: number;
  /** 例: '20〜30代' */
  ageRange?: string;
  /** 創設年 */
  founded?: number;
  /** 出場大会・戦績。エンジョイチームは無くてよい */
  achievements?: string[];
  /** 常設のメンバー募集文(公式サイトの募集ページに掲載) */
  memberRecruitNote?: string;
  /** お知らせ(新しい順) */
  news?: TeamNews[];
  /** 試合の予定と結果 */
  matches?: TeamMatch[];
  /** メンバー紹介 */
  members?: TeamMember[];
  /** Instagramのハンドル(@なし) */
  instagram?: string;
}
