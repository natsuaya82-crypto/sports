import { formatSlashDateWithWeekday } from '@/lib/local-date';
import { SUPPORTED_OPPORTUNITY_KINDS } from '@/domain/opportunity';

export const DAYS_TO_SHOW = 14;


/** 開始時間の選択肢(6:00〜22:00) */
export const START_TIMES = Array.from(
  { length: 17 },
  (_, i) => `${String(i + 6).padStart(2, '0')}:00`,
);

/** 何時間やるか */
export const DURATIONS = [
  { label: '1時間', hours: 1 },
  { label: '1.5時間', hours: 1.5 },
  { label: '2時間', hours: 2 },
  { label: '2.5時間', hours: 2.5 },
  { label: '3時間', hours: 3 },
] as const;

export const FEES = [0, 500, 1000, 1500, 2000, 3000] as const;

/** この画面で作れる募集の種類 */
export const POST_KINDS = SUPPORTED_OPPORTUNITY_KINDS;

/** 募集作成フォームで開いているシート */
export type PostSheetKey = 'date' | 'time' | 'duration' | 'fee';

export function dateChipLabel(date: string, index: number): string {
  if (index === 0) return '今日';
  if (index === 1) return '明日';
  return formatSlashDateWithWeekday(date);
}

export function durationLabel(hours: number): string | undefined {
  return DURATIONS.find((d) => d.hours === hours)?.label;
}

export function feeLabel(fee: number): string {
  return fee === 0 ? '無料' : `¥${fee.toLocaleString()}`;
}
