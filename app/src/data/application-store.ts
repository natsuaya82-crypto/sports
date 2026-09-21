import { useSyncExternalStore } from 'react';

import type { Recruitment } from '@/types/recruitment';

/** 応募のやりとりの1メッセージ */
export interface ChatMessage {
  id: string;
  from: 'me' | 'team';
  text: string;
}

/** 応募(1件=1つのやりとりスレッド) */
export interface Application {
  id: string;
  recruitmentId: string;
  /** 相手(主催)の表示名。募集から控えておく */
  teamName: string;
  recruitmentTitle: string;
  messages: ChatMessage[];
}

/**
 * 応募のメモリ上ストア。
 * 応募すると「応募履歴」「メッセージ」「募集詳細の応募済み表示」に反映される。
 */
let applications: Application[] = [];
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Application[] {
  return applications;
}

/** 応募一覧(新しい順) */
export function useApplications(): Application[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${seq}`;
}

/** 募集に応募する。作成した応募を返す(応募済みなら既存を返す) */
export function apply(recruitment: Recruitment, message: string): Application {
  const existing = applications.find((a) => a.recruitmentId === recruitment.id);
  if (existing) return existing;

  const application: Application = {
    id: nextId('app'),
    recruitmentId: recruitment.id,
    teamName: recruitment.teamName,
    recruitmentTitle: recruitment.title,
    messages: [
      { id: nextId('msg'), from: 'me', text: message },
      {
        id: nextId('msg'),
        from: 'team',
        text: '応募ありがとうございます!内容を確認して折り返しご連絡しますね。',
      },
    ],
  };
  applications = [application, ...applications];
  listeners.forEach((l) => l());
  return application;
}

/** やりとりにメッセージを追加する */
export function sendMessage(applicationId: string, text: string): void {
  applications = applications.map((a) =>
    a.id === applicationId
      ? { ...a, messages: [...a.messages, { id: nextId('msg'), from: 'me' as const, text }] }
      : a,
  );
  listeners.forEach((l) => l());
}
