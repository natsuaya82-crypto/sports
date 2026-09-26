import {
  getMatchScore,
  interleaveNewcomers,
  rankTeams,
  type MatchCriteria,
  type MatchTarget,
} from '../discovery';
import type { Participation } from '../participation';
import type { Team } from '../team';

const criteria: MatchCriteria = {
  sports: ['soccer'],
  level: 'middle',
  prefecture: '東京都',
  ward: '世田谷区',
  kinds: [],
};

function target(overrides: Partial<MatchTarget> = {}): MatchTarget {
  return {
    sports: ['soccer'],
    level: 'middle',
    prefecture: '東京都',
    ward: '世田谷区',
    kinds: [],
    ...overrides,
  };
}

describe('④ マッチ度', () => {
  it('すべて一致すれば1', () => {
    expect(getMatchScore(target(), criteria)).toBeCloseTo(1);
  });

  it('競技が違うと大きく下がる', () => {
    const score = getMatchScore(target({ sports: ['baseball'] }), criteria);
    expect(score).toBeCloseTo(0.6);
  });

  it('レベルは1段ずれるごとに半分', () => {
    const oneStep = getMatchScore(target({ level: 'serious' }), criteria);
    const twoSteps = getMatchScore(target({ level: 'enjoy' }), { ...criteria, level: 'serious' });
    expect(oneStep).toBeCloseTo(1 - 0.3 * 0.5);
    expect(twoSteps).toBeCloseTo(1 - 0.3 * 0.75);
  });

  it('同じ都道府県の別の区は半分、別の都道府県は0', () => {
    expect(getMatchScore(target({ ward: '大田区' }), criteria)).toBeCloseTo(0.9);
    expect(getMatchScore(target({ prefecture: '大阪府' }), criteria)).toBeCloseTo(0.8);
  });

  it('見ている側に希望が無ければ、競技や参加形態で差を付けない', () => {
    const open = { ...criteria, sports: [], kinds: [] };
    expect(getMatchScore(target({ sports: ['baseball'] }), open)).toBeCloseTo(1);
  });

  it('参加形態の希望があれば、重なるものを上にする', () => {
    const wants = { ...criteria, kinds: ['team_member' as const] };
    const hit = getMatchScore(target({ kinds: ['team_member'] }), wants);
    const miss = getMatchScore(target({ kinds: ['individual_join'] }), wants);
    expect(hit).toBeGreaterThan(miss);
  });
});

describe('③ 新規枠', () => {
  const isNew = (x: string) => x.startsWith('N');

  it('新規が4件のあいだ出てこなければ繰り上げる', () => {
    const ranked = ['A', 'B', 'C', 'D', 'E', 'N1'];
    expect(interleaveNewcomers(ranked, isNew, 4)).toEqual(['A', 'B', 'C', 'N1', 'D', 'E']);
  });

  it('元から上位にいる新規を後ろへ下げない', () => {
    const ranked = ['N1', 'A', 'B', 'C', 'D'];
    expect(interleaveNewcomers(ranked, isNew, 4)[0]).toBe('N1');
  });

  it('既に窓の中に新規がいれば繰り上げない', () => {
    const ranked = ['A', 'N1', 'B', 'C', 'D', 'N2'];
    expect(interleaveNewcomers(ranked, isNew, 4)).toEqual(['A', 'N1', 'B', 'C', 'D', 'N2']);
  });

  it('新規がいなければ順序を変えない', () => {
    expect(interleaveNewcomers(['A', 'B', 'C', 'D', 'E'], isNew, 4)).toEqual([
      'A', 'B', 'C', 'D', 'E',
    ]);
  });

  it('要素を失わず重複させない', () => {
    const ranked = ['A', 'N1', 'B', 'C', 'D', 'E', 'F', 'N2', 'N3', 'G'];
    const result = interleaveNewcomers(ranked, isNew, 3);
    expect([...result].sort()).toEqual([...ranked].sort());
  });
});

function makeTeam(overrides: Partial<Team>): Team {
  return {
    id: 't',
    name: 'チーム',
    sport: 'soccer',
    prefecture: '東京都',
    ward: '世田谷区',
    level: 'middle',
    recruitingKinds: [],
    photo: '',
    bio: '',
    tagline: '',
    color: '#000000',
    gallery: [],
    registeredAt: '2025-01-01',
    ...overrides,
  };
}

function held(teamId: string, opportunityId: string, recordedAt: string): Participation {
  return {
    id: `${teamId}-${opportunityId}`,
    applicationId: `app-${opportunityId}`,
    opportunityId,
    userId: 'someone',
    hostTeamId: teamId,
    status: 'attended',
    recordedAt,
  };
}

describe('チームの並び順', () => {
  const today = '2026-09-22';

  it('実績より相性を優先する', () => {
    const veteranButFar = makeTeam({ id: 'veteran', prefecture: '大阪府', ward: '北区' });
    const nearButNew = makeTeam({ id: 'near', registeredAt: '2026-01-01' });
    const records = Array.from({ length: 20 }, (_, i) =>
      held('veteran', `o${i}`, '2026-09-01'),
    );
    const context = { criteria, records, today };
    expect(rankTeams([veteranButFar, nearButNew], context)[0].id).toBe('near');
  });

  it('相性が同じなら、最近の実績があるほうを上にする', () => {
    const active = makeTeam({ id: 'active' });
    const idle = makeTeam({ id: 'idle' });
    const records = [held('active', 'o1', '2026-09-15')];
    const context = { criteria, records, today };
    expect(rankTeams([idle, active], context)[0].id).toBe('active');
  });

  it('同じ件数の実績なら、古いほうが弱い', () => {
    const recent = makeTeam({ id: 'recent' });
    const old = makeTeam({ id: 'old' });
    const records = [
      ...Array.from({ length: 5 }, (_, i) => held('recent', `r${i}`, '2026-09-10')),
      ...Array.from({ length: 5 }, (_, i) => held('old', `o${i}`, '2024-09-10')),
    ];
    const context = { criteria, records, today };
    expect(rankTeams([old, recent], context)[0].id).toBe('recent');
  });
});
