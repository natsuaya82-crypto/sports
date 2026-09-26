import type { Application } from '@/domain/application';

/**
 * 既存の応募のモック種。
 *
 * prototypeでは「チームが受け取った応募（Applicant）」「自分が送った応募
 * （Application）」「参加予定（ScheduleEntry）」が別々の型に分かれていたが、
 * すべて同じ概念なので Application 1つへ統合した（docs/DOMAIN.md 第8章）。
 *
 * 応募先は募集のIDで指定する。募集のIDはシードの並び順（r1, r2, ...）と
 * チームの常設募集（standing-<teamId>）で決まる。
 *
 * タイトルで引くと、同じ「メンバー募集(常設)」を持つチームが複数あるため
 * どのチームへの応募か決まらない。
 */
export const APPLICATION_SEEDS: readonly Application[] = [
  // デモユーザーが運営するチーム(t1: FC世田谷 / t2: 朝ソサイチ駒沢)が受け取った応募
  {
    id: 'a1',
    opportunityId: 'r1',
    applicantUserId: 'p1',
    applicantTeamId: null,
    status: 'pending',
    message: 'CBで応募します!対人守備が得意です。よろしくお願いします。',
    createdAt: '2026-07-27',
  },
  {
    id: 'a2',
    opportunityId: 'r1',
    applicantUserId: 'p2',
    applicantTeamId: null,
    status: 'pending',
    message: 'GK急募と見て応募しました。土日なら参加できます。',
    createdAt: '2026-07-26',
  },
  {
    id: 'a3',
    opportunityId: 'standing-t1',
    applicantUserId: 'p7',
    applicantTeamId: null,
    status: 'pending',
    message: 'FWです。上を目指すチームと聞いて興味を持ちました。一度体験できますか?',
    createdAt: '2026-07-24',
  },
  {
    id: 'a4',
    opportunityId: 'r5',
    applicantUserId: 'p8',
    applicantTeamId: null,
    status: 'pending',
    message: 'ピヴォできます!朝活気になっていました。',
    createdAt: '2026-07-25',
  },

  // デモユーザー自身の参加予定。prototypeの mockSchedule を応募として表現する。
  // 参加は accepted な応募である（docs/DOMAIN.md 第4章）。
  {
    id: 'a5',
    opportunityId: 'r5',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'accepted',
    message: '参加希望です。よろしくお願いします。',
    createdAt: '2026-07-20',
  },
  {
    id: 'a6',
    opportunityId: 'r11',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'accepted',
    message: 'キロ6分なら大丈夫です!',
    createdAt: '2026-07-21',
  },
  {
    id: 'a7',
    opportunityId: 'r9',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'pending',
    message: 'ブランクありますが参加したいです。',
    createdAt: '2026-07-22',
  },
];
