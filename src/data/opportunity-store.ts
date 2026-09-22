import type { Application } from '@/domain/application';
import type { Opportunity, OpportunityKind } from '@/domain/opportunity';
import type { Location } from '@/domain/location';
import type { Team } from '@/domain/team';
import type { Level } from '@/domain/level';
import type { Sport } from '@/domain/sport';
import { combineStores, createStore, type ReadableStore } from '@/lib/observable-store';
import { getDateFromToday, joinDateAndTime } from '@/lib/local-date';

import { applicationStore } from './application-store';
import { findLocationByName } from './location-store';
import { OPPORTUNITY_SEEDS, type OpportunitySeed } from './mock/opportunity-seed';
import { getHostUserId } from './user-store';
import { TEAM_SEEDS } from './mock/team-seed';

/** 主催チーム名から登録済みチームを引く。未登録の主催は hostTeamId が null になる */
function findHostTeamId(teamName: string): string | null {
  return TEAM_SEEDS.find((t) => t.name === teamName)?.id ?? null;
}

/**
 * 保存する形。受理済みの件数は持たない（docs/DOMAIN.md 9.1 / 9.3）。
 * 読み出すときに応募から数えて Opportunity にする。
 */
type StoredOpportunity = Omit<Opportunity, 'acceptedCount'>;

function toOpportunity(seed: OpportunitySeed, index: number): StoredOpportunity {
  const date = getDateFromToday(seed.dayOffset);
  const hostTeamId = findHostTeamId(seed.teamName);
  return {
    id: `r${index + 1}`,
    kind: seed.kind,
    sport: seed.sport,
    title: seed.title,
    startsAt: joinDateAndTime(date, seed.startTime),
    endsAt: joinDateAndTime(date, seed.endTime),
    location: findLocationByName(seed.venueName, seed.ward),
    distanceKm: seed.distanceKm,
    fee: seed.fee,
    level: seed.level,
    capacity: seed.capacity,
    reservedCount: seed.reservedCount,
    hostUserId: getHostUserId(hostTeamId, seed.teamName),
    hostTeamId,
    hostTeamName: seed.teamName,
    photo: `https://picsum.photos/seed/sports${index + 7}/400/300`,
    status: seed.closed === true ? 'closed' : 'open',
  };
}

/**
 * チームの常設メンバー募集。
 *
 * prototypeでは Team.recruitingKinds が「メンバーを募集中」と示すだけで、
 * 応募先になる実体が無かった。しかし
 * 「団体LPを見て直接応募する」は企画 第4章の中心機能であり、応募先は
 * Opportunity でなければ Application が表現できない（docs/DOMAIN.md 第3章）。
 * 日程が決まっていないため startsAt / endsAt は null で、日付軸の一覧には出ない。
 */
function toStandingOpportunity(team: Team): StoredOpportunity {
  return {
    id: `standing-${team.id}`,
    kind: 'team_member',
    sport: team.sport,
    title: 'メンバー募集(常設)',
    startsAt: null,
    endsAt: null,
    location: findLocationByName(team.homeGround ?? team.ward, team.ward),
    distanceKm: 0,
    fee: 0,
    level: team.level,
    capacity: team.memberCount ?? 1,
    reservedCount: 0,
    hostUserId: getHostUserId(team.id, team.name),
    hostTeamId: team.id,
    hostTeamName: team.name,
    photo: team.photo,
    status: 'open',
  };
}

const store = createStore<readonly StoredOpportunity[]>([
  ...OPPORTUNITY_SEEDS.map(toOpportunity),
  ...TEAM_SEEDS.filter((t) => t.recruitingKinds.includes('team_member')).map(
    toStandingOpportunity,
  ),
]);

function countAccepted(applications: readonly Application[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const a of applications) {
    if (a.status !== 'accepted') continue;
    counts.set(a.opportunityId, (counts.get(a.opportunityId) ?? 0) + 1);
  }
  return counts;
}

/**
 * 募集一覧の購読口。Reactへの接続は ui 側の hook が行う。
 *
 * 受理済みの件数は、応募が変わるたびにここで数え直す。
 * 応募を受理すれば残り枠が減り、カウンタを別に更新する必要が無い。
 */
export const opportunityStore: ReadableStore<readonly Opportunity[]> = combineStores(
  store,
  applicationStore,
  (opportunities, applications) => {
    const accepted = countAccepted(applications);
    return opportunities.map((o) => ({ ...o, acceptedCount: accepted.get(o.id) ?? 0 }));
  },
);

/** 作成時に画面から受け取る値。IDや写真など保存側で決まるものは含まない */
export interface NewOpportunityInput {
  kind: OpportunityKind;
  sport: Sport;
  title: string;
  /** `YYYY-MM-DD` */
  date: string;
  /** `HH:mm` */
  startTime: string;
  endTime: string;
  location: Location;
  fee: number;
  level: Level;
  capacity: number;
  hostUserId: string;
  hostTeamId: string | null;
  hostTeamName: string;
}

/** 募集を作成して一覧の先頭に追加する */
export function createOpportunity(input: NewOpportunityInput): StoredOpportunity {
  const id = `r-user-${Date.now()}`;
  const created: StoredOpportunity = {
    id,
    kind: input.kind,
    sport: input.sport,
    title: input.title,
    startsAt: joinDateAndTime(input.date, input.startTime),
    endsAt: joinDateAndTime(input.date, input.endTime),
    location: input.location,
    // 本来は会場と閲覧者の位置から算出する。モックでは近距離固定
    distanceKm: 1.0,
    fee: input.fee,
    level: input.level,
    capacity: input.capacity,
    reservedCount: 0,
    hostUserId: input.hostUserId,
    hostTeamId: input.hostTeamId,
    hostTeamName: input.hostTeamName,
    photo: `https://picsum.photos/seed/${id}/400/300`,
    status: 'open',
  };
  store.update((current) => [created, ...current]);
  return created;
}
