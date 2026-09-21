import { DEFAULT_AREA, getAreaLabel, isInArea } from '../area';
import { getShortPrefectureName, PREFECTURES, REGIONS } from '../prefecture';

describe('都道府県', () => {
  it('47件そろっている', () => {
    expect(PREFECTURES).toHaveLength(47);
  });

  it('重複がない', () => {
    expect(new Set(PREFECTURES).size).toBe(PREFECTURES.length);
  });

  it('地方の合計が全体と一致する', () => {
    const total = REGIONS.reduce((sum, r) => sum + r.prefectures.length, 0);
    expect(total).toBe(PREFECTURES.length);
  });

  it('末尾の都府県を落として短縮する', () => {
    expect(getShortPrefectureName('東京都')).toBe('東京');
    expect(getShortPrefectureName('大阪府')).toBe('大阪');
    expect(getShortPrefectureName('神奈川県')).toBe('神奈川');
  });

  it('北海道は短縮しない', () => {
    expect(getShortPrefectureName('北海道')).toBe('北海道');
  });
});

describe('エリアのラベル', () => {
  it('未選択はすべてのエリア', () => {
    expect(getAreaLabel({ prefectures: [] })).toBe('すべてのエリア');
  });

  it('1件は短縮名だけ', () => {
    expect(getAreaLabel({ prefectures: ['東京都'] })).toBe('東京');
  });

  it('複数件は先頭と残り件数', () => {
    expect(getAreaLabel({ prefectures: ['東京都', '千葉県', '埼玉県'] })).toBe('東京 ほか2');
  });
});

describe('エリアの判定', () => {
  it('未選択はすべて通す', () => {
    expect(isInArea('沖縄県', { prefectures: [] })).toBe(true);
  });

  it('選択した都道府県だけを通す', () => {
    const area = { prefectures: ['東京都' as const] };
    expect(isInArea('東京都', area)).toBe(true);
    expect(isInArea('千葉県', area)).toBe(false);
  });

  it('既定は東京都', () => {
    expect(DEFAULT_AREA.prefectures).toEqual(['東京都']);
  });
});
