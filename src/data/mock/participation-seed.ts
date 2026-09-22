import type { AttendanceStatus, Participation } from '@/domain/participation';
import { getDateFromToday } from '@/lib/local-date';

/**
 * 参加履歴のモック（docs/DOMAIN.md 9.2）。
 *
 * 1件ずつ書くと膨大になるため、「誰がどのチームの活動に、いつから何日おきに、
 * 何回出て何回休んだか」というパターンから組み立てる。
 * 日付はデモが古びないよう今日からの相対で持つ。
 *
 * 並び順とバッジの違いが画面で確かめられるよう、傾向をばらしている。
 *
 * - p1 ケンタ: 長く通って欠席なし（出席率◎・参加10回+）
 * - p2 ユウマ: 最近よく出ている
 * - p3 サラ: まだ2回だけ（件数が少なく出席率バッジは付かない）
 * - p4 タクミ: 欠席が多い
 * - p6 ハルカ: 昔は常連だったが最近来ていない（時間減衰で弱くなる）
 * - p5 / p7 / p8: 記録なし（p8 は登録したて）
 *
 * 募集一覧にある今後の募集とは別の、過去の活動の記録である。
 * 過去の募集そのものはモックに持たないため、opportunityId は
 * 「チームとその日」から決まる識別子にしている。
 */
interface AttendancePattern {
  userId: string;
  teamId: string;
  /** 最初の参加が何日前か */
  startDaysAgo: number;
  /** 何日おきか */
  everyDays: number;
  attended: number;
  noShow: number;
}

const PATTERNS: readonly AttendancePattern[] = [
  { userId: 'p1', teamId: 't1', startDaysAgo: 330, everyDays: 21, attended: 14, noShow: 0 },
  { userId: 'p2', teamId: 't2', startDaysAgo: 70, everyDays: 10, attended: 6, noShow: 1 },
  { userId: 'p2', teamId: 't1', startDaysAgo: 45, everyDays: 21, attended: 2, noShow: 0 },
  { userId: 'p3', teamId: 't5', startDaysAgo: 9, everyDays: 7, attended: 2, noShow: 0 },
  { userId: 'p4', teamId: 't6', startDaysAgo: 160, everyDays: 14, attended: 5, noShow: 4 },
  { userId: 'p6', teamId: 't7', startDaysAgo: 700, everyDays: 14, attended: 11, noShow: 1 },
  { userId: 'u1', teamId: 't3', startDaysAgo: 120, everyDays: 30, attended: 3, noShow: 0 },
];

function toRecords(pattern: AttendancePattern): Participation[] {
  const total = pattern.attended + pattern.noShow;
  return Array.from({ length: total }, (_, i) => {
    const daysAgo = pattern.startDaysAgo - i * pattern.everyDays;
    // 欠席は件数どおり均等に散らす。先頭や末尾に固めると時間減衰の効き方が偏る
    const status: AttendanceStatus =
      Math.floor(((i + 1) * pattern.noShow) / total) > Math.floor((i * pattern.noShow) / total)
        ? 'no_show'
        : 'attended';
    const opportunityId = `past-${pattern.teamId}-${daysAgo}`;
    return {
      id: `part-${pattern.userId}-${opportunityId}`,
      applicationId: `past-app-${pattern.userId}-${opportunityId}`,
      opportunityId,
      userId: pattern.userId,
      hostTeamId: pattern.teamId,
      status,
      recordedAt: getDateFromToday(-daysAgo),
    };
  });
}

export const PARTICIPATION_SEEDS: readonly Participation[] = PATTERNS.flatMap(toRecords);
