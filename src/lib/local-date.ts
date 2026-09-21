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

/** `YYYY-MM-DD` の曜日 */
export function getWeekday(date: string): string {
  const [year, month, day] = splitDate(date);
  return WEEKDAYS[new Date(year, month - 1, day).getDay()];
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
