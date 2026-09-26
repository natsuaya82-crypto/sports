/**
 * 購読できる値の入れ物。
 *
 * Reactを知らない。UIフレームワークへの接続は ui 側の hook が行う
 * （src/README.md のレイヤ境界）。
 */
export interface ReadableStore<T> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
}

export interface Store<T> extends ReadableStore<T> {
  set: (next: T) => void;
  update: (change: (current: T) => T) => void;
}

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();

  const set = (next: T): void => {
    if (Object.is(next, value)) return;
    value = next;
    listeners.forEach((listener) => listener());
  };

  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set,
    update: (change) => set(change(value)),
  };
}

/**
 * 2つのストアから値を計算するストア。
 *
 * どちらかの値が変わったときだけ計算し直し、変わらなければ前回と同じ参照を返す。
 * React の useSyncExternalStore は同じ値に対して同じ参照を返すことを要求するため、
 * 毎回計算し直すと無限に再描画される。
 */
export function combineStores<A, B, R>(
  first: ReadableStore<A>,
  second: ReadableStore<B>,
  combine: (a: A, b: B) => R,
): ReadableStore<R> {
  let cache: { a: A; b: B; value: R } | undefined;

  return {
    getSnapshot: () => {
      const a = first.getSnapshot();
      const b = second.getSnapshot();
      if (cache === undefined || !Object.is(cache.a, a) || !Object.is(cache.b, b)) {
        cache = { a, b, value: combine(a, b) };
      }
      return cache.value;
    },
    subscribe: (listener) => {
      const unsubscribeFirst = first.subscribe(listener);
      const unsubscribeSecond = second.subscribe(listener);
      return () => {
        unsubscribeFirst();
        unsubscribeSecond();
      };
    },
  };
}
