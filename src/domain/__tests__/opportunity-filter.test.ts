import {
  countActiveFilters,
  DEFAULT_FILTER,
  filterOpportunities,
  type OpportunityFilter,
} from '../opportunity-filter';
import type { Opportunity } from '../opportunity';

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'o1',
    kind: 'individual_join',
    sport: 'soccer',
    title: 'テスト募集',
    startsAt: '2026-09-27T19:00',
    endsAt: '2026-09-27T21:00',
    location: { id: 'v1', name: '会場', prefecture: '東京都', ward: '世田谷区' },
    distanceKm: 3,
    fee: 500,
    level: 'middle',
    capacity: 4,
    filledCount: 1,
    hostUserId: 'u-host',
    hostTeamId: 't1',
    hostTeamName: 'テストFC',
    photo: 'photo',
    status: 'open',
    ...overrides,
  };
}

function withFilter(overrides: Partial<OpportunityFilter>): OpportunityFilter {
  return { ...DEFAULT_FILTER, ...overrides };
}

describe('絞りこみ', () => {
  const soccer = makeOpportunity({ id: 'a', sport: 'soccer', fee: 0, distanceKm: 1 });
  const futsal = makeOpportunity({
    id: 'b',
    sport: 'futsal',
    kind: 'practice',
    level: 'enjoy',
    fee: 1500,
    distanceKm: 8,
    startsAt: '2026-09-27T09:00',
  });
  const all = [soccer, futsal];

  it('既定では何も落とさない', () => {
    expect(filterOpportunities(all, DEFAULT_FILTER)).toEqual(all);
  });

  it('競技で絞る', () => {
    expect(filterOpportunities(all, withFilter({ sports: ['futsal'] }))).toEqual([futsal]);
  });

  it('種別で絞る', () => {
    expect(filterOpportunities(all, withFilter({ kinds: ['practice' ] }))).toEqual([futsal]);
  });

  it('レベルで絞る', () => {
    expect(filterOpportunities(all, withFilter({ levels: ['enjoy'] }))).toEqual([futsal]);
  });

  it('時間帯で絞る', () => {
    expect(filterOpportunities(all, withFilter({ times: ['morning'] }))).toEqual([futsal]);
    expect(filterOpportunities(all, withFilter({ times: ['night'] }))).toEqual([soccer]);
  });

  it('費用の上限で絞る', () => {
    expect(filterOpportunities(all, withFilter({ fee: 'free' }))).toEqual([soccer]);
    expect(filterOpportunities(all, withFilter({ fee: 'u2000' }))).toEqual(all);
  });

  it('距離の上限で絞る', () => {
    expect(filterOpportunities(all, withFilter({ distance: 'd3' }))).toEqual([soccer]);
  });

  it('空きのあるものだけに絞ると、締切と満員が落ちる', () => {
    const closed = makeOpportunity({ id: 'c', status: 'closed' });
    const full = makeOpportunity({ id: 'd', capacity: 2, filledCount: 2 });
    const result = filterOpportunities([soccer, closed, full], withFilter({ openOnly: true }));
    expect(result).toEqual([soccer]);
  });

  it('時間帯で絞っている間は、日程未定の常設募集を出さない', () => {
    const standing = makeOpportunity({ id: 'e', startsAt: null, endsAt: null });
    const result = filterOpportunities([soccer, standing], withFilter({ times: ['night'] }));
    expect(result).toEqual([soccer]);
  });

  it('条件を重ねると両方に合うものだけが残る', () => {
    const result = filterOpportunities(all, withFilter({ sports: ['futsal'], fee: 'free' }));
    expect(result).toEqual([]);
  });
});

describe('有効な条件の数', () => {
  it('既定では0', () => {
    expect(countActiveFilters(DEFAULT_FILTER)).toBe(0);
  });

  it('競技はシート外の常設プルダウンなので数えない', () => {
    expect(countActiveFilters(withFilter({ sports: ['soccer'] }))).toBe(0);
  });

  it('シート内の条件を数える', () => {
    const filter = withFilter({
      kinds: ['practice'],
      levels: ['enjoy'],
      times: ['morning'],
      fee: 'free',
      distance: 'd3',
      openOnly: true,
    });
    expect(countActiveFilters(filter)).toBe(6);
  });
});
