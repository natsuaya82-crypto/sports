import { useSyncExternalStore } from 'react';

import type { Recruitment } from '@/types/recruitment';

import { mockRecruitments } from './mock-recruitments';

/**
 * 募集のメモリ上ストア(モック段階)。
 * 作成した募集をアプリ内のどの画面からも同じ一覧で見られるようにする。
 */
let recruitments: Recruitment[] = [...mockRecruitments];
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Recruitment[] {
  return recruitments;
}

/** 募集一覧(作成分を含む)。作成されると自動で再レンダリングされる */
export function useRecruitments(): Recruitment[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export type NewRecruitmentInput = Omit<
  Recruitment,
  'id' | 'photo' | 'filled' | 'distanceKm' | 'closed'
>;

/** 募集を作成して一覧の先頭に追加する */
export function addRecruitment(input: NewRecruitmentInput): Recruitment {
  const id = `r-user-${Date.now()}`;
  const item: Recruitment = {
    ...input,
    id,
    filled: 0,
    // 本来は投稿時に指定した場所と閲覧者の位置から算出する。モックでは近距離固定
    distanceKm: 1.0,
    photo: `https://picsum.photos/seed/${id}/400/300`,
  };
  recruitments = [item, ...recruitments];
  listeners.forEach((l) => l());
  return item;
}
