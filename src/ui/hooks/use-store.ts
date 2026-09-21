import { useSyncExternalStore } from 'react';

import type { ReadableStore } from '@/lib/observable-store';

/**
 * data層のストアをReactへ接続する。
 *
 * ストア自体はReactを知らない（src/README.md のレイヤ境界）。
 * Reactに依存するのはこの1箇所だけにする。
 */
export function useStore<T>(store: ReadableStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
}
