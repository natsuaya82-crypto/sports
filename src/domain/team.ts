import { z } from 'zod';

import { levelSchema } from './level';
import { opportunityKindSchema } from './opportunity';
import { prefectureSchema } from './prefecture';
import { sportSchema } from './sport';

/** チームのお知らせ（公式サイトのNEWS欄） */
export const teamNewsSchema = z.object({
  /** `YYYY-MM-DD` */
  date: z.string(),
  text: z.string(),
});

export type TeamNews = z.infer<typeof teamNewsSchema>;

/** 試合（公式サイトの日程・結果欄） */
export const teamMatchSchema = z.object({
  /** `YYYY-MM-DD` */
  date: z.string(),
  /** `HH:mm` */
  time: z.string().optional(),
  opponent: z.string(),
  venue: z.string().optional(),
  /** 大会名・節（例: 'リーグ戦 第9節'） */
  competition: z.string().optional(),
  /** 終了した試合のスコア。未設定なら予定扱い */
  result: z.object({ our: z.number().int(), their: z.number().int() }).optional(),
});

export type TeamMatch = z.infer<typeof teamMatchSchema>;

/**
 * メンバー紹介の1件（公式サイトの掲載情報）。
 *
 * docs/DOMAIN.md 第1章の TeamMember（権限判定に使う所属レコード）とは別物。
 * こちらは公開ページに載せる名簿であり、ログインアカウントと結びついていない。
 * 権限はモック段階では User.managedTeamIds で判定する。
 */
export const teamRosterEntrySchema = z.object({
  name: z.string(),
  /** 背番号 */
  number: z.number().int().optional(),
  position: z.string().optional(),
  /** 代表・キャプテンなどの肩書き */
  title: z.string().optional(),
});

export type TeamRosterEntry = z.infer<typeof teamRosterEntrySchema>;

/**
 * 団体。
 *
 * Teamはログインしない。Userが作成・管理する（docs/ARCHITECTURE.md 第8章）。
 *
 * tagline / color / gallery はチーム自身が編集するLPのコンテンツであり、
 * AIが決めるUIデザインではない。企画の「登録＝自分のLPが自動生成される」の実体。
 */
export const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  sport: sportSchema,
  prefecture: prefectureSchema,
  /** 主な活動エリア（市区町村） */
  ward: z.string(),
  level: levelSchema,
  /** いま募集している種類。空なら募集なし */
  recruitingKinds: z.array(opportunityKindSchema),
  photo: z.string(),
  bio: z.string(),
  /** サイトヒーローに出すキャッチコピー */
  tagline: z.string(),
  /** チームカラー（サイトのアクセント色） */
  color: z.string(),
  /** 活動写真 */
  gallery: z.array(z.string()),

  /** 以下は決まっていないチームもあるため任意。あるものだけ表示する */
  homeGround: z.string().optional(),
  /** 活動曜日・時間帯 */
  schedule: z.string().optional(),
  memberCount: z.number().int().optional(),
  /** 例: '20〜30代' */
  ageRange: z.string().optional(),
  founded: z.number().int().optional(),
  achievements: z.array(z.string()).optional(),
  /** 常設のメンバー募集文 */
  memberRecruitNote: z.string().optional(),
  news: z.array(teamNewsSchema).optional(),
  matches: z.array(teamMatchSchema).optional(),
  roster: z.array(teamRosterEntrySchema).optional(),
  /** Instagramのハンドル（@なし） */
  instagram: z.string().optional(),
});

export type Team = z.infer<typeof teamSchema>;

/** いま何か募集しているか */
export function isRecruiting(team: Team): boolean {
  return team.recruitingKinds.length > 0;
}
