import type { User } from '@/domain/user';

import { USER_SEEDS } from './mock/user-seed';

/** ユーザー一覧（スカウト対象の検索に使う） */
export function fetchUsers(): readonly User[] {
  return USER_SEEDS;
}

/** IDでユーザーを引く */
export function findUser(id: string): User | undefined {
  return USER_SEEDS.find((u) => u.id === id);
}
