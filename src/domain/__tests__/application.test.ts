import {
  getApplicationsByApplicant,
  getApplicationsForOpportunity,
  hasActiveApplication,
  isActive,
  type Application,
} from '../application';

function makeApplication(overrides: Partial<Application> = {}): Application {
  return {
    id: 'a1',
    opportunityId: 'o1',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'pending',
    message: 'よろしくお願いします',
    createdAt: '2026-09-20',
    ...overrides,
  };
}

describe('応募が生きているか', () => {
  it('検討中と受理は生きている', () => {
    expect(isActive(makeApplication({ status: 'pending' }))).toBe(true);
    expect(isActive(makeApplication({ status: 'accepted' }))).toBe(true);
  });

  it('不成立と取り下げは生きていない', () => {
    expect(isActive(makeApplication({ status: 'rejected' }))).toBe(false);
    expect(isActive(makeApplication({ status: 'withdrawn' }))).toBe(false);
  });
});

describe('重複応募の不変条件', () => {
  it('同じ募集へ有効な応募があれば検出する', () => {
    const applications = [makeApplication()];
    expect(hasActiveApplication(applications, 'o1', 'u1')).toBe(true);
  });

  it('取り下げ済みなら再応募できる', () => {
    const applications = [makeApplication({ status: 'withdrawn' })];
    expect(hasActiveApplication(applications, 'o1', 'u1')).toBe(false);
  });

  it('別の応募者や別の募集は干渉しない', () => {
    const applications = [makeApplication()];
    expect(hasActiveApplication(applications, 'o1', 'u2')).toBe(false);
    expect(hasActiveApplication(applications, 'o2', 'u1')).toBe(false);
  });
});

describe('応募の取り出し', () => {
  const older = makeApplication({ id: 'a1', createdAt: '2026-09-18' });
  const newer = makeApplication({ id: 'a2', createdAt: '2026-09-21' });
  const other = makeApplication({ id: 'a3', applicantUserId: 'u2', opportunityId: 'o2' });
  const all = [older, newer, other];

  it('応募者で絞り、新しい順に並べる', () => {
    expect(getApplicationsByApplicant(all, 'u1').map((a) => a.id)).toEqual(['a2', 'a1']);
  });

  it('募集で絞り、新しい順に並べる', () => {
    expect(getApplicationsForOpportunity(all, 'o1').map((a) => a.id)).toEqual(['a2', 'a1']);
  });
});
