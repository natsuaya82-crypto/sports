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
