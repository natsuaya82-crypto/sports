import { combineStores, createStore } from '../observable-store';

describe('combineStores', () => {
  it('元の値が変わらなければ同じ参照を返す', () => {
    const a = createStore(1);
    const b = createStore(2);
    const sum = combineStores(a, b, (x, y) => ({ total: x + y }));
    expect(sum.getSnapshot()).toBe(sum.getSnapshot());
  });

  it('どちらかが変われば計算し直す', () => {
    const a = createStore(1);
    const b = createStore(2);
    const sum = combineStores(a, b, (x, y) => x + y);
    expect(sum.getSnapshot()).toBe(3);
    b.set(10);
    expect(sum.getSnapshot()).toBe(11);
  });

  it('両方の変更を購読者へ伝え、解除できる', () => {
    const a = createStore(1);
    const b = createStore(2);
    const sum = combineStores(a, b, (x, y) => x + y);
    const listener = jest.fn();
    const unsubscribe = sum.subscribe(listener);
    a.set(5);
    b.set(6);
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    a.set(7);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
