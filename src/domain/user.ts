import { z } from 'zod';

import { levelSchema } from './level';
import { opportunityKindSchema } from './opportunity';
import { prefectureSchema } from './prefecture';
import { sportSchema, type Sport } from './sport';

/**
 * ユーザー。
 *
 * すべてのアカウントはUserである（docs/DOMAIN.md 第1章）。
 *
 * prototypeには「自分のアカウント（UserAccount）」と「スカウト対象の個人
 * （Person）」という2つの型があったが、どちらも同じ概念の公開プロフィールで
 * あり、同じ概念に別modelを作ることはCLAUDE.md 第17章が禁じている。
 * ここで1つに統合し、個人LPの項目を任意フィールドとして持たせる。
 */
export const userSchema = z.object({
  id: z.string(),
  displayName: z.string().min(1),
  avatar: z.string(),
  prefecture: prefectureSchema,
  ward: z.string(),
  bio: z.string(),
  /** やっている種目。先頭がメイン競技 */
  sports: z.array(sportSchema),
  level: levelSchema,
  /** 管理しているチームのID。モック段階ではこれがチーム権限の判定元 */
  managedTeamIds: z.array(z.string()),

  /** 以下は個人LPの項目。未入力なら未設定（企画書 第4章 個人LP） */
  /** 例: '20代' */
  age: z.string().optional(),
  /** ポジション（例: 'MF / FW'） */
  position: z.string().optional(),
  playStyle: z.string().optional(),
  /** 経歴 */
  experience: z.string().optional(),
  /** 活動可能な曜日・時間帯 */
  availability: z.string().optional(),
  /** 希望する参加形態 */
  wantedKinds: z.array(opportunityKindSchema).optional(),
});

export type User = z.infer<typeof userSchema>;

/** メイン競技。種目を1つも登録していなければ undefined */
export function getMainSport(user: User): User['sports'][number] | undefined {
  return user.sports[0];
}

/** そのチームを管理できるか。認可の実体はSupabase導入時にRLSへ移す */
export function canManageTeam(user: User, teamId: string): boolean {
  return user.managedTeamIds.includes(teamId);
}

/** スカウト対象として公開できるだけの情報が入っているか */
export function hasPublicProfile(user: User): boolean {
  return user.playStyle !== undefined && user.experience !== undefined;
}

/** 指定した種目をやっているか。種目未指定ならすべて通す */
function playsSport(user: User, sport: Sport | null): boolean {
  return sport === null || user.sports.includes(sport);
}

/** 名前・エリア・ポジション・プレースタイルのいずれかに一致するか */
function matchesKeyword(user: User, keyword: string): boolean {
  if (keyword === '') return true;
  return (
    user.displayName.includes(keyword) ||
    user.ward.includes(keyword) ||
    (user.position?.includes(keyword) ?? false) ||
    (user.playStyle?.includes(keyword) ?? false)
  );
}

/**
 * スカウトの候補を絞りこむ。
 *
 * 公開プロフィールが入っていない人と、自分自身は候補に出さない。
 */
export function findScoutCandidates(
  users: readonly User[],
  options: { viewerId: string; sport: Sport | null; keyword: string },
): User[] {
  const keyword = options.keyword.trim();
  return users.filter(
    (u) =>
      u.id !== options.viewerId &&
      hasPublicProfile(u) &&
      playsSport(u, options.sport) &&
      matchesKeyword(u, keyword),
  );
}

/** そのユーザーが管理しているチーム */
export function getManagedTeams<T extends { id: string }>(
  teams: readonly T[],
  user: User,
): T[] {
  return teams.filter((t) => canManageTeam(user, t.id));
}
