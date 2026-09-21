import { useSyncExternalStore } from 'react';

import type { Team } from '@/types/team';

import { mockTeams } from './mock-teams';

/**
 * チームのメモリ上ストア(モック段階)。
 * 公式サイトの編集内容をアプリ内のどの画面からも同じ状態で見られるようにする。
 */
let teams: Team[] = [...mockTeams];
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Team[] {
  return teams;
}

/** チーム一覧(編集内容を反映)。更新されると自動で再レンダリングされる */
export function useTeams(): Team[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** IDでチームを取得(編集内容を反映) */
export function useTeam(id: string | undefined): Team | undefined {
  const all = useTeams();
  return all.find((t) => t.id === id);
}

/** チーム情報を部分更新する */
export function updateTeam(id: string, patch: Partial<Omit<Team, 'id'>>): void {
  teams = teams.map((t) => (t.id === id ? { ...t, ...patch } : t));
  listeners.forEach((l) => l());
}
