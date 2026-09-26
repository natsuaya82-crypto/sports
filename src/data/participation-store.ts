import type { AttendanceStatus, Participation } from '@/domain/participation';
import { createStore, type ReadableStore } from '@/lib/observable-store';

import { PARTICIPATION_SEEDS } from './mock/participation-seed';

/**
 * 参加記録のストア（docs/DOMAIN.md 9.2）。
 *
 * 追記だけを行い、書き換えない。付け直しは新しい記録として足し、
 * 読む側が応募ごとに最新のものを採る（getLatestParticipations）。
 */
const store = createStore<readonly Participation[]>(PARTICIPATION_SEEDS);

/** 参加記録の購読口 */
export const participationStore: ReadableStore<readonly Participation[]> = store;

let sequence = 0;

export interface NewParticipationInput {
  applicationId: string;
  opportunityId: string;
  userId: string;
  hostTeamId: string | null;
  status: AttendanceStatus;
  /** `YYYY-MM-DD` */
  recordedAt: string;
}

/** 参加記録を追記する。記録できるかの判定は呼び出し側（application-review）が行う */
export function appendParticipation(input: NewParticipationInput): Participation {
  sequence += 1;
  const created: Participation = { id: `part-new-${sequence}`, ...input };
  store.update((current) => [...current, created]);
  return created;
}
