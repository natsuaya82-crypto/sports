import type { Application } from '@/domain/application';
import { createStore, type ReadableStore } from '@/lib/observable-store';

import { APPLICATION_SEEDS } from './mock/application-seed';

/**
 * 応募のストア。
 *
 * 募集（opportunity-store）を参照しない。募集側が受理済みの件数を数えるために
 * こちらを読むので、逆向きに依存すると循環する（CLAUDE.md 第4章）。
 */
const store = createStore<readonly Application[]>(APPLICATION_SEEDS);

/** 応募一覧の購読口 */
export const applicationStore: ReadableStore<readonly Application[]> = store;

/** 応募の状態を変える。受理できるかの判定は呼び出し側（application-review）が行う */
export function setApplicationStatus(id: string, status: Application['status']): void {
  store.update((current) => current.map((a) => (a.id === id ? { ...a, status } : a)));
}

let sequence = 0;

function nextId(): string {
  sequence += 1;
  return `app-${sequence}`;
}

export interface NewApplicationInput {
  opportunityId: string;
  applicantUserId: string;
  applicantTeamId: string | null;
  message: string;
}

/**
 * 応募を作成する。
 *
 * 同一Opportunityへ同一応募者が有効な応募を重複して持てない
 * （docs/DOMAIN.md 第3章の不変条件）。既に応募済みならそれを返す。
 * 本番ではDBの部分ユニークインデックスが保証する。
 */
export function createApplication(input: NewApplicationInput): Application {
  const existing = store
    .getSnapshot()
    .find(
      (a) =>
        a.opportunityId === input.opportunityId &&
        a.applicantUserId === input.applicantUserId &&
        (a.status === 'pending' || a.status === 'accepted'),
    );
  if (existing !== undefined) return existing;

  const created: Application = {
    id: nextId(),
    opportunityId: input.opportunityId,
    applicantUserId: input.applicantUserId,
    applicantTeamId: input.applicantTeamId,
    status: 'pending',
    message: input.message,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  store.update((current) => [created, ...current]);
  return created;
}
