import { z } from 'zod';

/** レベル感 */
export const levelSchema = z.enum(['enjoy', 'middle', 'serious']);

export type Level = z.infer<typeof levelSchema>;

export const LEVELS: readonly Level[] = levelSchema.options;

const LEVEL_LABELS: Record<Level, string> = {
  enjoy: 'エンジョイ',
  middle: 'ミドル',
  serious: 'ガチ',
};

export function getLevelLabel(level: Level): string {
  return LEVEL_LABELS[level];
}
