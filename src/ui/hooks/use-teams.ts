import type { Team } from '@/domain/team';
import { teamStore } from '@/data/team-store';

import { useStore } from './use-store';

/** チーム一覧（編集内容を反映） */
export function useTeams(): readonly Team[] {
  return useStore(teamStore);
}

/** IDでチームを取得（編集内容を反映） */
export function useTeam(id: string | undefined): Team | undefined {
  return useTeams().find((t) => t.id === id);
}
