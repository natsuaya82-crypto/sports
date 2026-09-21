import type { OpportunityKind } from '@/domain/opportunity';

export const DAYS_TO_SHOW = 14;

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

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

/**
 * この画面で作れる募集の種類。
 * domainには7種類あるが、prototypeが募集作成画面に出していたのはこの4つだけ。
 * 画面に足すかどうかはユーザーが決める（CLAUDE.md 第7章）。
 */
export const POST_KINDS: readonly OpportunityKind[] = [
  'individual_join',
  'team_member',
  'friendly_match',
  'practice',
];

/** 募集作成フォームで開いているシート */
export type PostSheetKey = 'date' | 'time' | 'duration' | 'fee';

/** 開始時刻 + 時間数 → 終了時刻(HH:mm) */
export function endTimeOf(startTime: string, hours: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = Math.min(h * 60 + m + hours * 60, 23 * 60 + 59);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function dateChipLabel(date: string, index: number): string {
  if (index === 0) return '今日';
  if (index === 1) return '明日';
  const [, m, d] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(date).getDay()];
  return `${m}/${d}(${weekday})`;
}

export function durationLabel(hours: number): string | undefined {
  return DURATIONS.find((d) => d.hours === hours)?.label;
}

export function feeLabel(fee: number): string {
  return fee === 0 ? '無料' : `¥${fee.toLocaleString()}`;
}
