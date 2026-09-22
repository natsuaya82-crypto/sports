import { BADGE_RULES } from './discovery-config';
import type { Participation } from './participation';
import {
  getTeamReputation,
  getUserReputation,
  isNewcomer,
  type TeamReputation,
  type UserReputation,
} from './reputation';
import type { Team } from './team';
import type { User } from './user';

/**
 * ⑤ 到達型バッジ（docs/DOMAIN.md 9.5）。
 *
 * 相対順位ではなく、条件を満たしたら付く印。他人との順位を作らないので、
 * 累計の件数を使っても「先に始めた人ほど有利」にはならない。
 */
type BadgeKey =
  | 'newcomer'
  | 'reliable'
  | 'veteran'
  | 'active'
  | 'experienced_host';

export interface Badge {
  key: BadgeKey;
  label: string;
}

const BADGE_LABELS: Record<BadgeKey, string> = {
  newcomer: 'はじめたばかり',
  reliable: '出席率◎',
  veteran: `参加${BADGE_RULES.veteranAttended}回+`,
  active: '活動中',
  experienced_host: `開催${BADGE_RULES.experiencedHostEvents}回+`,
};

function toBadges(keys: readonly (BadgeKey | false)[]): Badge[] {
  return keys
    .filter((k): k is BadgeKey => k !== false)
    .map((key) => ({ key, label: BADGE_LABELS[key] }));
}

function isReliable(reputation: UserReputation): boolean {
  return (
    reputation.weightedSample >= BADGE_RULES.reliableMinSample &&
    reputation.attendanceRate >= BADGE_RULES.reliableMinRate
  );
}

export function getUserBadges(
  user: User,
  records: readonly Participation[],
  today: string,
): Badge[] {
  const reputation = getUserReputation(user.id, records, today);
  return toBadges([
    isNewcomer(user.registeredAt, today) && 'newcomer',
    isReliable(reputation) && 'reliable',
    reputation.totalAttended >= BADGE_RULES.veteranAttended && 'veteran',
  ]);
}

function isExperiencedHost(reputation: TeamReputation): boolean {
  return reputation.totalEvents >= BADGE_RULES.experiencedHostEvents;
}

export function getTeamBadges(
  team: Team,
  records: readonly Participation[],
  today: string,
): Badge[] {
  const reputation = getTeamReputation(team.id, records, today);
  return toBadges([
    isNewcomer(team.registeredAt, today) && 'newcomer',
    reputation.activeRecently && 'active',
    isExperiencedHost(reputation) && 'experienced_host',
  ]);
}
