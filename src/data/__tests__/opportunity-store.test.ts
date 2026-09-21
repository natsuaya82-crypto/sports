import { isScheduled , opportunitySchema } from '@/domain/opportunity';

import { opportunityStore } from '../opportunity-store';
import { applicationStore } from '../application-store';
import { applicationSchema } from '@/domain/application';
import { APPLICATION_SEEDS } from '../mock/application-seed';
import { TEAM_SEEDS } from '../mock/team-seed';
import { teamSchema } from '@/domain/team';
import { USER_SEEDS } from '../mock/user-seed';
import { fetchUsers, findUser } from '../user-store';
import { findScoutCandidates , userSchema } from '@/domain/user';

describe('募集の組み立て', () => {
  const opportunities = opportunityStore.getSnapshot();

  it('すべてschemaを満たす', () => {
    for (const opportunity of opportunities) {
      expect(opportunitySchema.safeParse(opportunity).success).toBe(true);
    }
  });

  it('IDが重複しない', () => {
    const ids = opportunities.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('日程のある募集は開始が終了より後にならない', () => {
    for (const opportunity of opportunities.filter(isScheduled)) {
      expect(opportunity.startsAt <= opportunity.endsAt).toBe(true);
    }
  });

  it('旧RecruitmentTypeの4種類だけが日程つきで入っている', () => {
    const kinds = new Set(opportunities.filter(isScheduled).map((o) => o.kind));
    expect([...kinds].sort()).toEqual(
      ['friendly_match', 'individual_join', 'practice', 'team_member'].sort(),
    );
  });

  it('常設のメンバー募集は日程を持たず、主催チームが決まっている', () => {
    const standing = opportunities.filter((o) => !isScheduled(o));
    expect(standing.length).toBeGreaterThan(0);
    for (const opportunity of standing) {
      expect(opportunity.kind).toBe('team_member');
      expect(opportunity.hostTeamId).not.toBeNull();
      expect(opportunity.endsAt).toBeNull();
    }
  });

  it('主催Userが必ず実在する', () => {
    for (const opportunity of opportunities) {
      expect(findUser(opportunity.hostUserId)).toBeDefined();
    }
  });

  it('デモユーザーが管理するチームの募集は本人が主催になる', () => {
    const demo = USER_SEEDS[0];
    const hosted = opportunities.filter(
      (o) => o.hostTeamId !== null && demo.managedTeamIds.includes(o.hostTeamId),
    );
    expect(hosted.length).toBeGreaterThan(0);
    for (const opportunity of hosted) {
      expect(opportunity.hostUserId).toBe(demo.id);
    }
  });

  it('主催Userはスカウトの候補に出ない', () => {
    const hostIds = new Set(opportunities.map((o) => o.hostUserId));
    const candidates = findScoutCandidates(fetchUsers(), {
      viewerId: 'nobody',
      sport: null,
      keyword: '',
    });
    for (const candidate of candidates) {
      if (candidate.id === USER_SEEDS[0].id) continue;
      expect(hostIds.has(candidate.id)).toBe(false);
    }
  });

  it('主催チーム名は登録済みチームがあれば一致する', () => {
    for (const opportunity of opportunities) {
      if (opportunity.hostTeamId === null) continue;
      const team = TEAM_SEEDS.find((t) => t.id === opportunity.hostTeamId);
      expect(team?.name).toBe(opportunity.hostTeamName);
    }
  });
});

describe('モックデータ', () => {
  it('チームはすべてschemaを満たす', () => {
    for (const team of TEAM_SEEDS) {
      expect(teamSchema.safeParse(team).success).toBe(true);
    }
  });

  it('ユーザーはすべてschemaを満たす', () => {
    for (const user of USER_SEEDS) {
      expect(userSchema.safeParse(user).success).toBe(true);
    }
  });

  it('デモユーザーが管理するチームは実在する', () => {
    const demo = USER_SEEDS[0];
    for (const teamId of demo.managedTeamIds) {
      expect(TEAM_SEEDS.some((t) => t.id === teamId)).toBe(true);
    }
  });
});

describe('応募の組み立て', () => {
  const applications = applicationStore.getSnapshot();

  it('すべてschemaを満たす', () => {
    for (const application of applications) {
      expect(applicationSchema.safeParse(application).success).toBe(true);
    }
  });

  it('種がすべて募集に解決できている', () => {
    expect(applications).toHaveLength(APPLICATION_SEEDS.length);
  });

  it('応募先の募集が実在する', () => {
    const ids = new Set(opportunityStore.getSnapshot().map((o) => o.id));
    for (const application of applications) {
      expect(ids.has(application.opportunityId)).toBe(true);
    }
  });

  it('応募者が実在する', () => {
    for (const application of applications) {
      expect(USER_SEEDS.some((u) => u.id === application.applicantUserId)).toBe(true);
    }
  });

  it('同一募集へ同一応募者の有効な応募が重複しない', () => {
    const seen = new Set<string>();
    for (const a of applications) {
      if (a.status !== 'pending' && a.status !== 'accepted') continue;
      const key = `${a.opportunityId}:${a.applicantUserId}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
