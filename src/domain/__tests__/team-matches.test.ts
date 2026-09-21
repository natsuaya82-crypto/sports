import { getFinishedMatches, getUpcomingMatches, type TeamMatch } from '../team';
import { compareByStartDate, type Opportunity } from '../opportunity';

const matches: TeamMatch[] = [
  { date: '2026-09-10', opponent: '過去A', result: { our: 2, their: 1 } },
  { date: '2026-09-20', opponent: '過去B', result: { our: 0, their: 3 } },
  { date: '2026-10-05', opponent: '未来A' },
  { date: '2026-09-28', opponent: '未来B' },
  // 結果が未入力のまま過ぎた試合は、これからの試合には出さない
  { date: '2026-09-01', opponent: '未記入' },
];

const TODAY = '2026-09-25';

describe('これからの試合', () => {
  it('結果が無く今日以降のものを近い順で返す', () => {
    expect(getUpcomingMatches(matches, TODAY).map((m) => m.opponent)).toEqual([
      '未来B',
      '未来A',
    ]);
  });

  it('当日の試合は含む', () => {
    const today: TeamMatch[] = [{ date: TODAY, opponent: '当日' }];
    expect(getUpcomingMatches(today, TODAY)).toHaveLength(1);
  });

  it('試合が未設定でも落ちない', () => {
    expect(getUpcomingMatches(undefined, TODAY)).toEqual([]);
  });
});

describe('終了した試合', () => {
  it('結果のあるものを新しい順で返す', () => {
    expect(getFinishedMatches(matches).map((m) => m.opponent)).toEqual([
      '過去B',
      '過去A',
    ]);
  });

  it('試合が未設定でも落ちない', () => {
    expect(getFinishedMatches(undefined)).toEqual([]);
  });
});

describe('募集の並び順', () => {
  const withDate = (id: string, startsAt: string | null) =>
    ({ id, startsAt }) as Opportunity;

  it('開催日の昇順に並び、日程未定は末尾へ行く', () => {
    const list = [
      withDate('standing', null),
      withDate('late', '2026-10-01T10:00'),
      withDate('early', '2026-09-26T10:00'),
    ];
    expect([...list].sort(compareByStartDate).map((o) => o.id)).toEqual([
      'early',
      'late',
      'standing',
    ]);
  });

  it('日程未定どうしは順序を変えない', () => {
    expect(compareByStartDate(withDate('a', null), withDate('b', null))).toBe(0);
  });
});
