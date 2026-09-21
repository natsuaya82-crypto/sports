import { favoriteStore } from '@/data/favorite-store';

import { useStore } from './use-store';

/** おきにいりの募集IDセット */
export function useFavorites(): ReadonlySet<string> {
  return useStore(favoriteStore);
}
