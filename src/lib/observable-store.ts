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
