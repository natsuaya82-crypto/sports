import { z } from 'zod';

import { getShortPrefectureName, prefectureSchema, type Prefecture } from './prefecture';

/** エリア絞りこみの選択状態 */
export const areaSelectionSchema = z.object({
  /** 空配列 = すべての都道府県 */
  prefectures: z.array(prefectureSchema),
});

export type AreaSelection = z.infer<typeof areaSelectionSchema>;

export const DEFAULT_AREA: AreaSelection = { prefectures: ['東京都'] };

/** ヘッダーに出すラベル（例: 東京 / 東京 ほか2） */
export function getAreaLabel(area: AreaSelection): string {
  if (area.prefectures.length === 0) return 'すべてのエリア';
  if (area.prefectures.length === 1) return getShortPrefectureName(area.prefectures[0]);
  const rest = area.prefectures.length - 1;
  return `${getShortPrefectureName(area.prefectures[0])} ほか${rest}`;
}

/**
 * その都道府県がエリア選択に合うか。
 * 距離の近い順で並べる前提なので、絞りは都道府県単位のみ。
 */
export function isInArea(prefecture: Prefecture, area: AreaSelection): boolean {
  return area.prefectures.length === 0 || area.prefectures.includes(prefecture);
}
