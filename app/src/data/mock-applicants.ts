/** チームが受け取った応募(受け手側) */
export interface Applicant {
  id: string;
  /** 応募してきた個人のID(mock-people) */
  personId: string;
  /** 応募先チームのID */
  teamId: string;
  /** 応募した募集のタイトル */
  recruitmentTitle: string;
  /** 応募メッセージ */
  message: string;
  /** YYYY-MM-DD */
  date: string;
  status: 'new' | 'replied' | 'accepted';
}

/**
 * デモユーザーが運営するチーム(t1: FC世田谷 / t2: 朝ソサイチ駒沢)への応募。
 */
export const mockApplicants: Applicant[] = [
  {
    id: 'a1',
    personId: 'p1',
    teamId: 't1',
    recruitmentTitle: '【FC世田谷】助っ人DF・GK募集!リーグ戦',
    message: 'CBで応募します!対人守備が得意です。よろしくお願いします。',
    date: '2026-07-27',
    status: 'new',
  },
  {
    id: 'a2',
    personId: 'p2',
    teamId: 't1',
    recruitmentTitle: '【FC世田谷】助っ人DF・GK募集!リーグ戦',
    message: 'GK急募と見て応募しました。土日なら参加できます。',
    date: '2026-07-26',
    status: 'new',
  },
  {
    id: 'a3',
    personId: 'p7',
    teamId: 't1',
    recruitmentTitle: 'メンバー募集(常設)',
    message: 'FWです。上を目指すチームと聞いて興味を持ちました。一度体験できますか?',
    date: '2026-07-24',
    status: 'replied',
  },
  {
    id: 'a4',
    personId: 'p8',
    teamId: 't2',
    recruitmentTitle: '【朝活】7人制ソサイチ助っ人FW募集',
    message: 'ピヴォできます!朝活気になっていました。',
    date: '2026-07-25',
    status: 'new',
  },
];

/** チームIDで応募者を取得(新しい順) */
export function applicantsForTeam(teamId: string): Applicant[] {
  return mockApplicants
    .filter((a) => a.teamId === teamId)
    .sort((a, b) => b.date.localeCompare(a.date));
}
