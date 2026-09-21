import type { ApplicationStatus } from '@/domain/application';

/**
 * 既存の応募のモック種。
 *
 * prototypeでは「チームが受け取った応募（Applicant）」「自分が送った応募
 * （Application）」「参加予定（ScheduleEntry）」が別々の型に分かれていたが、
 * すべて同じ概念なので Application 1つへ統合した（docs/DOMAIN.md 第8章）。
 *
 * 応募先は募集のタイトルで指定する。IDは起動時に組み立てられるため、
 * ここでは安定しているタイトルで引く。
 */
export interface ApplicationSeed {
  id: string;
  /** 応募先の募集タイトル */
  opportunityTitle: string;
  applicantUserId: string;
  applicantTeamId: string | null;
  status: ApplicationStatus;
  message: string;
  /** `YYYY-MM-DD` */
  createdAt: string;
}

export const APPLICATION_SEEDS: readonly ApplicationSeed[] = [
  // デモユーザーが運営するチーム(t1: FC世田谷 / t2: 朝ソサイチ駒沢)が受け取った応募
  {
    id: 'a1',
    opportunityTitle: '【FC世田谷】助っ人DF・GK募集!リーグ戦',
    applicantUserId: 'p1',
    applicantTeamId: null,
    status: 'pending',
    message: 'CBで応募します!対人守備が得意です。よろしくお願いします。',
    createdAt: '2026-07-27',
  },
  {
    id: 'a2',
    opportunityTitle: '【FC世田谷】助っ人DF・GK募集!リーグ戦',
    applicantUserId: 'p2',
    applicantTeamId: null,
    status: 'pending',
    message: 'GK急募と見て応募しました。土日なら参加できます。',
    createdAt: '2026-07-26',
  },
  {
    id: 'a3',
    opportunityTitle: 'メンバー募集(常設)',
    applicantUserId: 'p7',
    applicantTeamId: null,
    status: 'pending',
    message: 'FWです。上を目指すチームと聞いて興味を持ちました。一度体験できますか?',
    createdAt: '2026-07-24',
  },
  {
    id: 'a4',
    opportunityTitle: '【朝活】7人制ソサイチ助っ人FW募集',
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
    opportunityTitle: '【朝活】7人制ソサイチ助っ人FW募集',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'accepted',
    message: '参加希望です。よろしくお願いします。',
    createdAt: '2026-07-20',
  },
  {
    id: 'a6',
    opportunityTitle: '皇居ラン 一緒に走りましょう(キロ6分)',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'accepted',
    message: 'キロ6分なら大丈夫です!',
    createdAt: '2026-07-21',
  },
  {
    id: 'a7',
    opportunityTitle: '日曜午後ゆるバスケ!ブランク歓迎',
    applicantUserId: 'u1',
    applicantTeamId: null,
    status: 'pending',
    message: 'ブランクありますが参加したいです。',
    createdAt: '2026-07-22',
  },
];
