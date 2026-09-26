import { createStore, type ReadableStore } from '@/lib/observable-store';

const store = createStore<ReadonlySet<string>>(new Set<string>());

/** おきにいりの募集IDの購読口 */
export const favoriteStore: ReadableStore<ReadonlySet<string>> = store;

/** おきにいりの付け外し */
export function toggleFavorite(opportunityId: string): void {
  store.update((current) => {
    const next = new Set(current);
    if (next.has(opportunityId)) {
      next.delete(opportunityId);
    } else {
      next.add(opportunityId);
    }
    return next;
  });
}
