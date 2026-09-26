import type { Team } from '@/domain/team';
import { createStore, type ReadableStore } from '@/lib/observable-store';

import { TEAM_SEEDS } from './mock/team-seed';

const store = createStore<readonly Team[]>(TEAM_SEEDS);

/** チーム一覧の購読口 */
export const teamStore: ReadableStore<readonly Team[]> = store;

/** チーム情報を部分更新する */
export function updateTeam(id: string, patch: Partial<Omit<Team, 'id'>>): void {
  store.update((current) => current.map((t) => (t.id === id ? { ...t, ...patch } : t)));
}
