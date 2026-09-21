import { getLastMessage, type MessageThread } from '../message';
import { isRecruiting, type Team } from '../team';
import { canManageTeam, getMainSport, hasPublicProfile, type User } from '../user';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'u1',
    displayName: 'たなか なつ',
    avatar: 'avatar',
    prefecture: '東京都',
    ward: '世田谷区',
    bio: '',
    sports: ['soccer', 'futsal'],
    level: 'middle',
    managedTeamIds: ['t1'],
    ...overrides,
  };
}

function makeTeam(overrides: Partial<Team> = {}): Team {
  return {
    id: 't1',
    name: 'テストFC',
    sport: 'soccer',
    prefecture: '東京都',
    ward: '世田谷区',
    level: 'middle',
    recruitingKinds: [],
    photo: 'photo',
    bio: '',
    tagline: '',
    color: '#000000',
    gallery: [],
    ...overrides,
  };
}

describe('ユーザー', () => {
  it('先頭の種目がメイン競技', () => {
    expect(getMainSport(makeUser())).toBe('soccer');
  });

  it('種目未登録なら undefined', () => {
    expect(getMainSport(makeUser({ sports: [] }))).toBeUndefined();
  });

  it('管理しているチームだけ操作できる', () => {
    const user = makeUser();
    expect(canManageTeam(user, 't1')).toBe(true);
    expect(canManageTeam(user, 't9')).toBe(false);
  });

  it('個人LPが埋まっていれば公開できる', () => {
    expect(hasPublicProfile(makeUser())).toBe(false);
    const filled = makeUser({ playStyle: '守備的DF', experience: '社会人リーグ' });
    expect(hasPublicProfile(filled)).toBe(true);
  });
});

describe('チーム', () => {
  it('募集がなければ募集中ではない', () => {
    expect(isRecruiting(makeTeam())).toBe(false);
  });

  it('募集があれば募集中', () => {
    expect(isRecruiting(makeTeam({ recruitingKinds: ['team_member'] }))).toBe(true);
  });
});

describe('やりとり', () => {
  it('最後の1通を返す', () => {
    const thread: MessageThread = {
      id: 'th1',
      applicationId: 'a1',
      messages: [
        { id: 'm1', author: 'applicant', text: '応募します', sentAt: '2026-09-20T10:00:00Z' },
        { id: 'm2', author: 'host', text: 'ありがとうございます', sentAt: '2026-09-20T11:00:00Z' },
      ],
    };
    expect(getLastMessage(thread)?.text).toBe('ありがとうございます');
  });

  it('1通も無ければ undefined', () => {
    const empty: MessageThread = { id: 'th1', applicationId: 'a1', messages: [] };
    expect(getLastMessage(empty)).toBeUndefined();
  });
});
