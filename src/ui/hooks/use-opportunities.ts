import type { Opportunity } from '@/domain/opportunity';
import { opportunityStore } from '@/data/opportunity-store';

import { useStore } from './use-store';

/** 募集一覧（作成分を含む） */
export function useOpportunities(): readonly Opportunity[] {
  return useStore(opportunityStore);
}

/** IDで募集を引く */
export function useOpportunity(id: string | undefined): Opportunity | undefined {
  return useOpportunities().find((o) => o.id === id);
}
