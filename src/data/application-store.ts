import type { Application } from '@/domain/application';
import { createStore, type ReadableStore } from '@/lib/observable-store';

import { APPLICATION_SEEDS } from './mock/application-seed';
import { opportunityStore } from './opportunity-store';

/** タイトルから募集IDを引く。見つからない種は読み込まない */
function findOpportunityIdByTitle(title: string): string | undefined {
  return opportunityStore.getSnapshot().find((o) => o.title === title)?.id;
}

function toApplications(): Application[] {
  return APPLICATION_SEEDS.flatMap((seed) => {
    const opportunityId = findOpportunityIdByTitle(seed.opportunityTitle);
    if (opportunityId === undefined) return [];
    return [
      {
        id: seed.id,
        opportunityId,
        applicantUserId: seed.applicantUserId,
        applicantTeamId: seed.applicantTeamId,
        status: seed.status,
        message: seed.message,
        createdAt: seed.createdAt,
      },
    ];
  });
}

const store = createStore<readonly Application[]>(toApplications());

/** 応募一覧の購読口 */
export const applicationStore: ReadableStore<readonly Application[]> = store;

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
