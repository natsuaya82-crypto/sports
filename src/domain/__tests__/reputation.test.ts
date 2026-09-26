import type { Application } from '../application';
import { canAccept } from '../application';
import { getTeamBadges, getUserBadges } from '../badge';
import type { Opportunity } from '../opportunity';
import { getFilledCount, getRemainingCapacity } from '../opportunity';
import {
  canRecordAttendance,
  getAttendanceOf,
  getLatestParticipations,
  type Participation,
} from '../participation';
import {
  getDecayWeight,
  getTeamReputation,
  getUserReputation,
  isNewcomer,
} from '../reputation';
import type { Team } from '../team';
import type { User } from '../user';

const TODAY = '2026-09-22';

function record(overrides: Partial<Participation>): Participation {
  return {
    id: 'p',
    applicationId: 'a',
    opportunityId: 'o',
    userId: 'u1',
    hostTeamId: 't1',
    status: 'attended',
    recordedAt: TODAY,
    ...overrides,
  };
}

function many(count: number, status: Participation['status'], recordedAt = TODAY) {
  return Array.from({ length: count }, (_, i) =>
    record({ id: `${status}${i}`, applicationId: `${status}-${recordedAt}-${i}`, status, recordedAt }),
  );
}

describe('① 時間減衰', () => {
  it('当日は1、半減期で半分、その倍で4分の1', () => {
    expect(getDecayWeight(TODAY, TODAY)).toBeCloseTo(1);
    expect(getDecayWeight('2026-06-24', TODAY)).toBeCloseTo(0.5);
    expect(getDecayWeight('2026-03-26', TODAY)).toBeCloseTo(0.25);
  });
});

describe('② 出席率の縮約', () => {
  it('記録が無ければ全体平均', () => {
    expect(getUserReputation('u1', [], TODAY).attendanceRate).toBeCloseTo(0.85);
  });

  it('1回参加して1回出席しただけでは100%にならない', () => {
    const rate = getUserReputation('u1', many(1, 'attended'), TODAY).attendanceRate;
    expect(rate).toBeLessThan(0.95);
    expect(rate).toBeGreaterThan(0.85);
  });

  it('件数が増えるほど実際の出席率に近づく', () => {
    const few = getUserReputation('u1', many(2, 'attended'), TODAY).attendanceRate;
    const lots = getUserReputation('u1', many(30, 'attended'), TODAY).attendanceRate;
    expect(lots).toBeGreaterThan(few);
    expect(lots).toBeGreaterThan(0.98);
  });

  it('欠席が多いと下がる', () => {
    const records = [...many(5, 'attended'), ...many(5, 'no_show')];
    expect(getUserReputation('u1', records, TODAY).attendanceRate).toBeLessThan(0.7);
  });

  it('昔の欠席は、最近の出席ほど効かない', () => {
    const recovered = [...many(5, 'no_show', '2024-09-22'), ...many(5, 'attended')];
    const lapsed = [...many(5, 'attended', '2024-09-22'), ...many(5, 'no_show')];
    const a = getUserReputation('u1', recovered, TODAY).attendanceRate;
    const b = getUserReputation('u1', lapsed, TODAY).attendanceRate;
    expect(a).toBeGreaterThan(b);
  });

  it('他人の記録は数えない', () => {
    const records = many(10, 'no_show').map((r) => ({ ...r, userId: 'other' }));
    expect(getUserReputation('u1', records, TODAY).attendanceRate).toBeCloseTo(0.85);
  });
});

describe('出欠の付け直し', () => {
  it('同じ応募は最新の記録だけが有効', () => {
    const records = [
      record({ id: 'first', status: 'no_show', recordedAt: '2026-09-20' }),
      record({ id: 'fixed', status: 'attended', recordedAt: '2026-09-21' }),
    ];
    expect(getLatestParticipations(records)).toHaveLength(1);
    expect(getAttendanceOf(records, 'a')).toBe('attended');
  });

  it('まだ付けていなければ undefined', () => {
    expect(getAttendanceOf([], 'a')).toBeUndefined();
  });
});

describe('チームの実績', () => {
  it('同じ募集の出席は1回の開催として数える', () => {
    const records = [
      record({ id: 'x1', applicationId: 'a1', opportunityId: 'o1' }),
      record({ id: 'x2', applicationId: 'a2', opportunityId: 'o1' }),
    ];
    expect(getTeamReputation('t1', records, TODAY).totalEvents).toBe(1);
  });

  it('欠席だけの募集は開催に数えない', () => {
    const records = [record({ status: 'no_show' })];
    expect(getTeamReputation('t1', records, TODAY).totalEvents).toBe(0);
  });

  it('30日以内に開催があれば活動中', () => {
    expect(getTeamReputation('t1', [record({ recordedAt: '2026-09-01' })], TODAY).activeRecently).toBe(true);
    expect(getTeamReputation('t1', [record({ recordedAt: '2026-07-01' })], TODAY).activeRecently).toBe(false);
  });
});

describe('③ 新規の判定', () => {
  it('登録から30日以内なら新規', () => {
    expect(isNewcomer('2026-09-01', TODAY)).toBe(true);
    expect(isNewcomer('2026-08-23', TODAY)).toBe(true);
    expect(isNewcomer('2026-08-22', TODAY)).toBe(false);
  });
});

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    displayName: 'たなか',
    avatar: '',
    prefecture: '東京都',
    ward: '世田谷区',
    bio: '',
    sports: ['soccer'],
    level: 'middle',
    managedTeamIds: [],
    registeredAt: '2025-01-01',
    ...overrides,
  };
}

function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 't1',
    name: 'FC',
    sport: 'soccer',
    prefecture: '東京都',
    ward: '世田谷区',
    level: 'middle',
    recruitingKinds: [],
    photo: '',
    bio: '',
    tagline: '',
    color: '#000',
    gallery: [],
    registeredAt: '2025-01-01',
    ...overrides,
  };
}

const keys = (badges: { key: string }[]) => badges.map((b) => b.key);

describe('⑤ バッジ', () => {
  it('登録したてなら「はじめたばかり」', () => {
    expect(keys(getUserBadges(makeUser({ registeredAt: '2026-09-10' }), [], TODAY))).toContain('newcomer');
  });

  it('記録が少ないうちは出席率バッジを出さない', () => {
    expect(keys(getUserBadges(makeUser(), many(2, 'attended'), TODAY))).not.toContain('reliable');
  });

  it('記録が十分で出席率が高ければ出席率バッジ', () => {
    expect(keys(getUserBadges(makeUser(), many(20, 'attended'), TODAY))).toContain('reliable');
  });

  it('累計10回出席で参加回数バッジ', () => {
    expect(keys(getUserBadges(makeUser(), many(9, 'attended'), TODAY))).not.toContain('veteran');
    expect(keys(getUserBadges(makeUser(), many(10, 'attended'), TODAY))).toContain('veteran');
  });

  it('チームは最近の開催で「活動中」', () => {
    const records = [record({ recordedAt: '2026-09-15' })];
    expect(keys(getTeamBadges(makeTeam(), records, TODAY))).toContain('active');
  });

  it('チームは累計10回の開催で開催回数バッジ', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      record({ id: `h${i}`, applicationId: `a${i}`, opportunityId: `o${i}`, recordedAt: '2024-01-01' }),
    );
    const badges = keys(getTeamBadges(makeTeam(), records, TODAY));
    expect(badges).toContain('experienced_host');
    expect(badges).not.toContain('active');
  });
});

function makeOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'o',
    kind: 'individual_join',
    sport: 'soccer',
    title: '募集',
    startsAt: '2026-09-20T19:00',
    endsAt: '2026-09-20T21:00',
    location: { id: 'v', name: '会場', prefecture: '東京都', ward: '世田谷区' },
    distanceKm: 1,
    fee: 0,
    level: 'middle',
    capacity: 3,
    reservedCount: 1,
    acceptedCount: 1,
    hostUserId: 'h',
    hostTeamId: 't1',
    hostTeamName: 'FC',
    photo: '',
    status: 'open',
    ...overrides,
  };
}

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'a',
    opportunityId: 'o',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'pending',
    message: '',
    createdAt: '2026-09-01',
    ...overrides,
  };
}

describe('残り枠（9.3）', () => {
  it('アプリ外の確保分と受理済みの応募を合わせて数える', () => {
    const opportunity = makeOpportunity();
    expect(getFilledCount(opportunity)).toBe(2);
    expect(getRemainingCapacity(opportunity)).toBe(1);
  });
});

describe('受理と出欠の条件', () => {
  it('空きがあれば検討中の応募を受理できる', () => {
    expect(canAccept(makeApplication(), makeOpportunity())).toBe(true);
  });

  it('満員なら受理できない', () => {
    expect(canAccept(makeApplication(), makeOpportunity({ acceptedCount: 2 }))).toBe(false);
  });

  it('受理済みの応募は受理し直さない', () => {
    expect(canAccept(makeApplication({ status: 'accepted' }), makeOpportunity())).toBe(false);
  });

  it('受理済みで開催日を過ぎていれば出欠を付けられる', () => {
    const accepted = makeApplication({ status: 'accepted' });
    expect(canRecordAttendance(accepted, makeOpportunity(), TODAY)).toBe(true);
  });

  it('開催前には付けられない', () => {
    const accepted = makeApplication({ status: 'accepted' });
    const future = makeOpportunity({ startsAt: '2026-10-01T19:00', endsAt: '2026-10-01T21:00' });
    expect(canRecordAttendance(accepted, future, TODAY)).toBe(false);
  });

  it('受理していない応募には付けられない', () => {
    expect(canRecordAttendance(makeApplication(), makeOpportunity(), TODAY)).toBe(false);
  });

  it('日程未定の常設募集には付けられない', () => {
    const accepted = makeApplication({ status: 'accepted' });
    const standing = makeOpportunity({ startsAt: null, endsAt: null });
    expect(canRecordAttendance(accepted, standing, TODAY)).toBe(false);
  });
});
