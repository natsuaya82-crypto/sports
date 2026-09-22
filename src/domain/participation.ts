import type { Application } from './application';
import { getOpportunityDate, type Opportunity } from './opportunity';

/**
 * 参加記録（docs/DOMAIN.md 9.2）。
 *
 * 出席率は回数のカウンタではなく、この記録の履歴から計算する（9.1）。
 * 受理された応募に対して、開催日を過ぎてから主催者が付ける。
 */
export type AttendanceStatus = 'attended' | 'no_show';

export interface Participation {
  id: string;
  applicationId: string;
  opportunityId: string;
  /** 参加した（しなかった）人 */
  userId: string;
  /** 主催チーム。個人主催なら null */
  hostTeamId: string | null;
  status: AttendanceStatus;
  /** 記録した日（`YYYY-MM-DD`）。時間減衰の起点になる */
  recordedAt: string;
}

/**
 * 出欠を記録できるか。
 * 受理済みで、開催日を過ぎていること。日程未定の常設募集には記録しない。
 */
export function canRecordAttendance(
  application: Application,
  opportunity: Opportunity,
  today: string,
): boolean {
  if (application.status !== 'accepted') return false;
  const date = getOpportunityDate(opportunity);
  return date !== null && date <= today;
}

/**
 * 応募ごとに最新の記録だけを残す。
 * 付け直しは上書きせず記録し直すため、同じ応募に複数件ありうる（9.2）。
 */
export function getLatestParticipations(
  records: readonly Participation[],
): Participation[] {
  const latest = new Map<string, Participation>();
  for (const record of records) {
    const current = latest.get(record.applicationId);
    if (current === undefined || current.recordedAt <= record.recordedAt) {
      latest.set(record.applicationId, record);
    }
  }
  return [...latest.values()];
}

/** その応募の最新の出欠。まだ付けていなければ undefined */
export function getAttendanceOf(
  records: readonly Participation[],
  applicationId: string,
): AttendanceStatus | undefined {
  return getLatestParticipations(records).find((r) => r.applicationId === applicationId)
    ?.status;
}
