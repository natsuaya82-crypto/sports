import { z } from 'zod';

import { prefectureSchema } from './prefecture';

/** 活動場所。会場・グラウンド単位 */
export const locationSchema = z.object({
  id: z.string(),
  /** 会場名 */
  name: z.string(),
  prefecture: prefectureSchema,
  /** 市区町村 */
  ward: z.string(),
});

export type Location = z.infer<typeof locationSchema>;
