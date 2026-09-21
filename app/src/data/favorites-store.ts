import { useSyncExternalStore } from 'react';

/**
 * おきにいり(募集ID)のメモリ上ストア。
 * さがす・おきにいりタブ・募集詳細のハートを同期させる。
 */
let favorites: ReadonlySet<string> = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ReadonlySet<string> {
  return favorites;
}

/** おきにいりの募集IDセット */
export function useFavorites(): ReadonlySet<string> {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** おきにいりの付け外し */
export function toggleFavorite(id: string): void {
  const next = new Set(favorites);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  favorites = next;
  listeners.forEach((l) => l());
}
