import { z } from 'zod';

/**
 * 種目。
 *
 * スポーツが増えても種目ごとに構造をコピーしない（docs/ARCHITECTURE.md 第6章）。
 * 種目固有の属性が必要になった時点で、明示的な拡張を検討する。
 */
export const sportSchema = z.enum([
  'soccer',
  'futsal',
  'baseball',
  'basketball',
  'volleyball',
  'running',
]);

export type Sport = z.infer<typeof sportSchema>;

export const SPORTS: readonly Sport[] = sportSchema.options;

/** 表示名。文言はprototypeをSource of Truthとする（CLAUDE.md 第7章） */
const SPORT_LABELS: Record<Sport, string> = {
  soccer: 'サッカー',
  futsal: 'フットサル',
  baseball: '野球',
  basketball: 'バスケ',
  volleyball: 'バレー',
  running: '陸上',
};

export function getSportLabel(sport: Sport): string {
  return SPORT_LABELS[sport];
}
