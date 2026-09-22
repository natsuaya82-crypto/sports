import type { Participation } from '@/domain/participation';
import { participationStore } from '@/data/participation-store';

import { useStore } from './use-store';

/** 参加記録の履歴（docs/DOMAIN.md 9.2） */
export function useParticipations(): readonly Participation[] {
  return useStore(participationStore);
}
