import { z } from 'zod';

import { isFull, type Opportunity } from './opportunity';

/** 応募の状態（docs/DOMAIN.md 第3章） */
const applicationStatusSchema = z.enum([
  'pending',
  'accepted',
  'rejected',
  'withdrawn',
]);

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

/**
 * 応募。
 *
 * 個人参加もチーム対チームも1テーブルで扱う。個人が応募する場合は
 * applicantTeamId が null、Teamとして応募する場合に入る。
 */
export const applicationSchema = z.object({
  id: z.string(),
  opportunityId: z.string(),
  applicantUserId: z.string(),
  applicantTeamId: z.string().nullable(),
  status: applicationStatusSchema,
  message: z.string(),
  createdAt: z.string(),
});

export type Application = z.infer<typeof applicationSchema>;

/** まだ生きている応募か。取り下げ・不成立は数えない */
export function isActive(application: Application): boolean {
  return application.status === 'pending' || application.status === 'accepted';
}

/**
 * 同一Opportunityに対して同一応募者が有効な応募を既に持っているか。
 *
 * docs/DOMAIN.md 第3章の不変条件。DB側では部分ユニークインデックスで保証する。
 * ここはその不変条件を前提にした問い合わせであって、二重実装ではない。
 */
export function hasActiveApplication(
  applications: readonly Application[],
  opportunityId: string,
  applicantUserId: string,
): boolean {
  return applications.some(
    (a) =>
      a.opportunityId === opportunityId &&
      a.applicantUserId === applicantUserId &&
      isActive(a),
  );
}

/** 指定した応募者の応募を新しい順で返す */
export function getApplicationsByApplicant(
  applications: readonly Application[],
  applicantUserId: string,
): Application[] {
  return applications
    .filter((a) => a.applicantUserId === applicantUserId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 指定したチームが主催する募集へ届いた応募を新しい順で返す。
 *
 * 主催しているかは Opportunity.hostTeamId で決まる（docs/DOMAIN.md 第2章）。
 * 応募者の確認画面と、管理画面の未対応件数が同じ判定を共有する。
 */
export function getApplicationsForTeam(
  applications: readonly Application[],
  opportunities: readonly { id: string; hostTeamId: string | null }[],
  teamId: string,
): Application[] {
  const hosted = new Set(
    opportunities.filter((o) => o.hostTeamId === teamId).map((o) => o.id),
  );
  return applications
    .filter((a) => hosted.has(a.opportunityId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** まだ対応していない応募の件数 */
export function countPendingApplications(applications: readonly Application[]): number {
  return applications.filter((a) => a.status === 'pending').length;
}

/** 指定したOpportunityへの応募を新しい順で返す */
export function getApplicationsForOpportunity(
  applications: readonly Application[],
  opportunityId: string,
): Application[] {
  return applications
    .filter((a) => a.opportunityId === opportunityId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 応募を受理できるか。
 * まだ検討中で、募集に空きがあること。定員を超えて受理しない。
 */
export function canAccept(application: Application, opportunity: Opportunity): boolean {
  return application.status === 'pending' && !isFull(opportunity);
}
