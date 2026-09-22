import {
  getEndTime,
  getOpportunityDate,
  getRemainingCapacity,
  getStartTime,
  getTimeOfDay,
  isFull,
  isOpen,
  isScheduled,
  type Opportunity,
} from '../opportunity';

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
    reservedCount: 1,
    acceptedCount: 0,
    hostUserId: 'u-host',
    hostTeamId: 't1',
    hostTeamName: 'テストFC',
    photo: 'photo',
    status: 'open',
    ...overrides,
  };
}

describe('残り枠', () => {
  it('capacity から埋まっている人数を引く', () => {
    expect(getRemainingCapacity(makeOpportunity())).toBe(3);
  });

  it('埋まりすぎても負にならない', () => {
    const over = makeOpportunity({ capacity: 2, reservedCount: 5, acceptedCount: 0 });
    expect(getRemainingCapacity(over)).toBe(0);
    expect(isFull(over)).toBe(true);
  });
});

describe('応募を受け付けているか', () => {
  it('空きがあり締切前なら受け付ける', () => {
    expect(isOpen(makeOpportunity())).toBe(true);
  });

  it('満員なら受け付けない', () => {
    expect(isOpen(makeOpportunity({ capacity: 2, reservedCount: 2, acceptedCount: 0 }))).toBe(false);
  });

  it('締切済みなら空きがあっても受け付けない', () => {
    expect(isOpen(makeOpportunity({ status: 'closed' }))).toBe(false);
  });
});

describe('日時', () => {
  it('開催日と時刻を取り出す', () => {
    const opportunity = makeOpportunity();
    expect(getOpportunityDate(opportunity)).toBe('2026-09-27');
    expect(getStartTime(opportunity)).toBe('19:00');
    expect(getEndTime(opportunity)).toBe('21:00');
  });

  it('日程未定の常設募集は null を返す', () => {
    const standing = makeOpportunity({ startsAt: null, endsAt: null });
    expect(isScheduled(standing)).toBe(false);
    expect(getOpportunityDate(standing)).toBeNull();
    expect(getStartTime(standing)).toBeNull();
    expect(getTimeOfDay(standing)).toBeNull();
  });

  it('開始時刻から時間帯を決める', () => {
    const at = (time: string) => getTimeOfDay(makeOpportunity({ startsAt: `2026-09-27T${time}` }));
    expect(at('07:00')).toBe('morning');
    expect(at('11:59')).toBe('morning');
    expect(at('12:00')).toBe('day');
    expect(at('16:59')).toBe('day');
    expect(at('17:00')).toBe('night');
    expect(at('22:00')).toBe('night');
  });
});
