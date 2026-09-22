import { findScoutCandidates, getManagedTeams, type User } from '../user';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    displayName: 'たなか なつ',
    avatar: 'avatar',
    prefecture: '東京都',
    ward: '世田谷区',
    bio: '',
    sports: ['soccer'],
    level: 'middle',
    managedTeamIds: [],
    registeredAt: '2025-01-01',
    playStyle: '守備的DF',
    experience: '社会人リーグ',
    ...overrides,
  };
}

const viewer = makeUser({ id: 'me' });

describe('スカウトの候補', () => {
  const candidate = makeUser({ id: 'p1', displayName: 'ケンタ', position: 'CB / SB' });
  const futsal = makeUser({ id: 'p2', displayName: 'ユウマ', sports: ['futsal'] });
  const noProfile = makeUser({
    id: 'p3',
    displayName: 'サラ',
    playStyle: undefined,
    experience: undefined,
  });
  const all = [viewer, candidate, futsal, noProfile];

  const find = (sport: User['sports'][number] | null, keyword: string) =>
    findScoutCandidates(all, { viewerId: viewer.id, sport, keyword }).map((u) => u.id);

  it('自分自身は候補に出さない', () => {
    expect(find(null, '')).not.toContain('me');
  });

  it('個人LPが未入力の人は候補に出さない', () => {
    expect(find(null, '')).not.toContain('p3');
  });

  it('種目で絞る', () => {
    expect(find('futsal', '')).toEqual(['p2']);
  });

  it('種目未指定なら種目で落とさない', () => {
    expect(find(null, '')).toEqual(['p1', 'p2']);
  });

  it('名前で検索する', () => {
    expect(find(null, 'ケンタ')).toEqual(['p1']);
  });

  it('ポジションで検索する', () => {
    expect(find(null, 'CB')).toEqual(['p1']);
  });

  it('エリアで検索する', () => {
    expect(find(null, '世田谷')).toEqual(['p1', 'p2']);
  });

  it('前後の空白は無視する', () => {
    expect(find(null, '  ケンタ  ')).toEqual(['p1']);
  });

  it('一致しなければ空', () => {
    expect(find(null, '該当なし')).toEqual([]);
  });
});

describe('管理しているチーム', () => {
  const teams = [{ id: 't1' }, { id: 't2' }, { id: 't3' }];

  it('managedTeamIds に入っているものだけ返す', () => {
    const user = makeUser({ managedTeamIds: ['t1', 't3'] });
    expect(getManagedTeams(teams, user).map((t) => t.id)).toEqual(['t1', 't3']);
  });

  it('管理していなければ空', () => {
    expect(getManagedTeams(teams, makeUser())).toEqual([]);
  });
});
