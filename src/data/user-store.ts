import type { Team } from '@/domain/team';
import type { User } from '@/domain/user';

import { OPPORTUNITY_SEEDS } from './mock/opportunity-seed';
import { TEAM_SEEDS } from './mock/team-seed';
import { USER_SEEDS } from './mock/user-seed';

/**
 * チームの主催User。
 *
 * 主催は常にUserである（docs/DOMAIN.md 第2章）。モックには team を作った
 * アカウントのデータが無いため、ここで組み立てて参照が解決する状態を保つ。
 *
 * - デモユーザーが管理しているチーム（managedTeamIds）は本人が主催
 * - それ以外はチームごとに主催Userを1人置く
 *
 * 個人LPの項目を持たないため、スカウトの候補には出ない
 * （docs/DOMAIN.md 第8章 モック段階で許している非正規化）。
 */
function toHostUser(team: Team): User {
  return {
    id: hostUserIdFor(team.id),
    displayName: team.name,
    avatar: team.photo,
    prefecture: team.prefecture,
    ward: team.ward,
    bio: team.bio,
    sports: [team.sport],
    level: team.level,
    managedTeamIds: [team.id],
  };
}

/**
 * チームとして登録されていない主催者。
 *
 * モックの募集にはチームページを持たない主催者名も出てくる。
 * その場合も主催Userは存在しなければならないため、名前から組み立てる。
 */
function toUnregisteredHostUser(teamName: string): User {
  const seed = OPPORTUNITY_SEEDS.find((o) => o.teamName === teamName);
  return {
    id: hostUserIdFor(teamName),
    displayName: teamName,
    avatar: `https://picsum.photos/seed/${encodeURIComponent(teamName)}/200/200`,
    prefecture: '東京都',
    ward: seed?.ward ?? '',
    bio: '',
    sports: seed === undefined ? [] : [seed.sport],
    level: seed?.level ?? 'enjoy',
    managedTeamIds: [],
  };
}

function hostUserIdFor(key: string): string {
  return `u-host-${key}`;
}

/** そのチームを管理している登録済みユーザー。いなければ undefined */
function findManagerOf(teamId: string): User | undefined {
  return USER_SEEDS.find((u) => u.managedTeamIds.includes(teamId));
}

const TEAM_HOSTS: readonly User[] = TEAM_SEEDS.filter(
  (t) => findManagerOf(t.id) === undefined,
).map(toHostUser);

const UNREGISTERED_HOST_NAMES: readonly string[] = [
  ...new Set(
    OPPORTUNITY_SEEDS.map((o) => o.teamName).filter(
      (name) => !TEAM_SEEDS.some((t) => t.name === name),
    ),
  ),
];

const ALL_USERS: readonly User[] = [
  ...USER_SEEDS,
  ...TEAM_HOSTS,
  ...UNREGISTERED_HOST_NAMES.map(toUnregisteredHostUser),
];

/**
 * 主催UserのID。
 * チームとして登録されていれば管理者、いなければ主催者名から決まるUser。
 */
export function getHostUserId(teamId: string | null, teamName: string): string {
  if (teamId === null) return hostUserIdFor(teamName);
  return findManagerOf(teamId)?.id ?? hostUserIdFor(teamId);
}

/** ユーザー一覧（スカウト対象の検索に使う） */
export function fetchUsers(): readonly User[] {
  return ALL_USERS;
}

/** IDでユーザーを引く */
export function findUser(id: string): User | undefined {
  return ALL_USERS.find((u) => u.id === id);
}
