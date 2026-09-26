import { getDateFromToday } from '@/lib/local-date';

import { PARTICIPATION_SEEDS } from '../mock/participation-seed';

const count = (userId: string, status: string) =>
  PARTICIPATION_SEEDS.filter((r) => r.userId === userId && r.status === status).length;

describe('参加履歴のモック', () => {
  it('パターンどおりの件数で出席・欠席が作られる', () => {
    expect(count('p1', 'attended')).toBe(14);
    expect(count('p1', 'no_show')).toBe(0);
    expect(count('p4', 'attended')).toBe(5);
    expect(count('p4', 'no_show')).toBe(4);
    expect(count('p6', 'no_show')).toBe(1);
  });

  it('IDが重複しない', () => {
    const ids = PARTICIPATION_SEEDS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('記録日は今日以前', () => {
    const today = getDateFromToday(0);
    for (const record of PARTICIPATION_SEEDS) {
      expect(record.recordedAt <= today).toBe(true);
    }
  });
});
