/** ローカルタイムゾーンの日付・日時を文字列で組み立てる。ドメイン知識を持たない */

/** 今日から offset 日後の `YYYY-MM-DD` */
export function getDateFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** `YYYY-MM-DD` と `HH:mm` から `YYYY-MM-DDTHH:mm` */
export function joinDateAndTime(date: string, time: string): string {
  return `${date}T${time}`;
}

/** 曜日の表示名。index は `Date.getDay()` に対応する */
export const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

function splitDate(date: string): [number, number, number] {
  const [year, month, day] = date.split('-').map(Number);
  return [year, month, day];
}

/**
 * `YYYY-MM-DD` の曜日番号（0=日曜）。
 *
 * `new Date('2026-09-27')` はUTCの0時として解釈されるため、UTCより西の
 * タイムゾーンでは前日の曜日になる。日付の各要素からローカルの日付を
 * 組み立てて、実行環境に依存しないようにする。
 */
export function getWeekdayIndex(date: string): number {
  const [year, month, day] = splitDate(date);
  return new Date(year, month - 1, day).getDay();
}

/** `YYYY-MM-DD` の曜日 */
export function getWeekday(date: string): string {
  return WEEKDAYS[getWeekdayIndex(date)];
}

/** `YYYY-MM-DD` の日。カレンダーのマスに出す数字 */
export function getDayOfMonth(date: string): number {
  return splitDate(date)[2];
}

/**
 * 開始時刻に時間数を足した `HH:mm`。
 * その日のうちに収める（24時をまたがない）。
 */
export function addHoursToTime(startTime: string, hours: number): string {
  const [hour, minute] = startTime.split(':').map(Number);
  const END_OF_DAY = 23 * 60 + 59;
  const total = Math.min(hour * 60 + minute + hours * 60, END_OF_DAY);
  const paddedHour = String(Math.floor(total / 60)).padStart(2, '0');
  const paddedMinute = String(total % 60).padStart(2, '0');
  return `${paddedHour}:${paddedMinute}`;
}

/** `YYYY-MM-DD` を「M月D日」で */
export function formatMonthDay(date: string): string {
  const [, month, day] = splitDate(date);
  return `${month}月${day}日`;
}

/** `YYYY-MM-DD` を「M月D日(曜)」で */
export function formatMonthDayWithWeekday(date: string): string {
  return `${formatMonthDay(date)}(${getWeekday(date)})`;
}

/** `YYYY-MM-DD` を「M/D(曜)」で */
export function formatSlashDateWithWeekday(date: string): string {
  const [, month, day] = splitDate(date);
  return `${month}/${day}(${getWeekday(date)})`;
}

/**
 * 2つの `YYYY-MM-DD` の間の日数（to - from）。
 * 夏時間の切り替えで1日が23/25時間になっても狂わないよう、UTCの暦日で数える。
 */
export function getDaysBetween(from: string, to: string): number {
  const [fy, fm, fd] = splitDate(from);
  const [ty, tm, td] = splitDate(to);
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / MS_PER_DAY);
}
