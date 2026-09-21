import {
  formatMonthDay,
  formatMonthDayWithWeekday,
  formatSlashDateWithWeekday,
  getDateFromToday,
  getWeekday,
  joinDateAndTime,
} from '../local-date';

describe('日付の組み立て', () => {
  it('今日を YYYY-MM-DD で返す', () => {
    expect(getDateFromToday(0)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('日付と時刻をつなぐ', () => {
    expect(joinDateAndTime('2026-09-27', '19:00')).toBe('2026-09-27T19:00');
  });
});

describe('日付の表示', () => {
  // 2026-09-27 は日曜
  it('曜日を返す', () => {
    expect(getWeekday('2026-09-27')).toBe('日');
    expect(getWeekday('2026-09-28')).toBe('月');
  });

  it('M月D日', () => {
    expect(formatMonthDay('2026-09-27')).toBe('9月27日');
    expect(formatMonthDay('2026-12-01')).toBe('12月1日');
  });

  it('M月D日(曜)', () => {
    expect(formatMonthDayWithWeekday('2026-09-27')).toBe('9月27日(日)');
  });

  it('M/D(曜)', () => {
    expect(formatSlashDateWithWeekday('2026-09-27')).toBe('9/27(日)');
  });
});
