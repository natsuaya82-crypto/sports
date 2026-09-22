import { canAccept } from '@/domain/application';
import { canRecordAttendance, type AttendanceStatus } from '@/domain/participation';

import { applicationStore, setApplicationStatus } from './application-store';
import { opportunityStore } from './opportunity-store';
import { appendParticipation } from './participation-store';

/**
 * 主催者が応募をさばく操作。
 *
 * 募集・応募・参加記録の3つにまたがるため、どれか1つのストアに置かずここにまとめる。
 * できるかどうかの判定は domain の関数が持ち、ここは判定を呼んで保存するだけ。
 * 本番ではこの判定をRLSとDB制約でも保証する（docs/DOMAIN.md 第5章）。
 */

export type ReviewResult = { ok: true } | { ok: false; reason: string };

function find(applicationId: string) {
  const application = applicationStore.getSnapshot().find((a) => a.id === applicationId);
  const opportunity =
    application === undefined
      ? undefined
      : opportunityStore.getSnapshot().find((o) => o.id === application.opportunityId);
  return { application, opportunity };
}

/** 応募を受理する。空きが無ければ受理しない */
export function acceptApplication(applicationId: string): ReviewResult {
  const { application, opportunity } = find(applicationId);
  if (application === undefined || opportunity === undefined) {
    return { ok: false, reason: '応募が見つかりませんでした' };
  }
  if (!canAccept(application, opportunity)) {
    return { ok: false, reason: '定員に達しているため受理できません' };
  }
  setApplicationStatus(applicationId, 'accepted');
  return { ok: true };
}

/**
 * 出欠を記録する。
 * 受理済みで開催日を過ぎた応募にだけ付けられる。付け直しは追記になる。
 */
export function recordAttendance(
  applicationId: string,
  status: AttendanceStatus,
  today: string,
): ReviewResult {
  const { application, opportunity } = find(applicationId);
  if (application === undefined || opportunity === undefined) {
    return { ok: false, reason: '応募が見つかりませんでした' };
  }
  if (!canRecordAttendance(application, opportunity, today)) {
    return { ok: false, reason: '開催日を過ぎた受理済みの応募にだけ記録できます' };
  }
  appendParticipation({
    applicationId,
    opportunityId: opportunity.id,
    userId: application.applicantUserId,
    hostTeamId: opportunity.hostTeamId,
    status,
    recordedAt: today,
  });
  return { ok: true };
}
