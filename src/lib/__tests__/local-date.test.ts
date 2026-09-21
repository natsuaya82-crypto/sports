import {
  addHoursToTime,
  formatMonthDay,
  formatMonthDayWithWeekday,
  formatSlashDateWithWeekday,
  getDateFromToday,
  getDayOfMonth,
  getWeekday,
  getWeekdayIndex,
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

describe('タイムゾーンに依存しない日付の解釈', () => {
  // new Date('2026-09-27') はUTCの0時として解釈されるため、UTCより西の
  // タイムゾーンでは前日の曜日になる。日付の要素から組み立てて回避している。
  it('UTCより西でも曜日がずれない', () => {
    const original = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
      expect(getWeekdayIndex('2026-09-27')).toBe(0);
      expect(getWeekday('2026-09-27')).toBe('日');
    } finally {
      process.env.TZ = original;
    }
  });

  it('日を取り出す', () => {
    expect(getDayOfMonth('2026-09-27')).toBe(27);
    expect(getDayOfMonth('2026-12-01')).toBe(1);
  });
});

describe('終了時刻の計算', () => {
  it('開始時刻に時間数を足す', () => {
    expect(addHoursToTime('19:00', 2)).toBe('21:00');
    expect(addHoursToTime('09:30', 1.5)).toBe('11:00');
  });

  it('30分刻みを扱える', () => {
    expect(addHoursToTime('07:00', 2.5)).toBe('09:30');
  });

  it('日付をまたがず、その日の終わりで止まる', () => {
    expect(addHoursToTime('22:00', 3)).toBe('23:59');
  });
});
