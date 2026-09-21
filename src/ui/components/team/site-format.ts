import type { Opportunity } from '@/domain/opportunity';
import { getOpportunityDate } from '@/domain/opportunity';
import type { TeamMatch } from '@/domain/team';
import { getDateFromToday } from '@/lib/local-date';

/** `YYYY-MM-DD` を「M月D日」で */
export function formatDate(date: string): string {
  const [, m, d] = date.split('-').map(Number);
  return `${m}月${d}日`;
}

/** `YYYY-MM-DD` を「M/D(曜)」で */
export function formatDateWithWeekday(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][new Date(y, m - 1, d).getDay()];
  return `${m}/${d}(${weekday})`;
}

/** これからの試合(結果がなく日付が今日以降)を近い順で */
export function upcomingMatches(matches: TeamMatch[] | undefined): TeamMatch[] {
  const today = getDateFromToday(0);
  return (matches ?? [])
    .filter((m) => !m.result && m.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** 終了した試合(結果あり)を新しい順で */
export function finishedMatches(matches: TeamMatch[] | undefined): TeamMatch[] {
  return (matches ?? [])
    .filter((m) => m.result != null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * サイトの募集一覧の並び順。
 *
 * prototypeは開催日の昇順だった。日程が決まっていない常設募集は日付を
 * 持たないため、日付のあるものを先に並べ、常設募集を末尾へ置く。
 */
export function compareByOpportunityDate(a: Opportunity, b: Opportunity): number {
  const dateA = getOpportunityDate(a);
  const dateB = getOpportunityDate(b);
  if (dateA === null) return dateB === null ? 0 : 1;
  if (dateB === null) return -1;
  return dateA.localeCompare(dateB);
}
