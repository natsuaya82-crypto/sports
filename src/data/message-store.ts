import type { MessageThread } from '@/domain/message';
import { createStore, type ReadableStore } from '@/lib/observable-store';

const store = createStore<readonly MessageThread[]>([]);

/** やりとりスレッドの購読口 */
export const messageThreadStore: ReadableStore<readonly MessageThread[]> = store;

let sequence = 0;

function nextId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * 応募に対するやりとりを開始する。
 * 応募直後の自動返信までを1スレッドとして作る（prototypeの挙動）。
 */
export function createThread(applicationId: string, firstMessage: string): MessageThread {
  const existing = store.getSnapshot().find((t) => t.applicationId === applicationId);
  if (existing !== undefined) return existing;

  const thread: MessageThread = {
    id: nextId('thread'),
    applicationId,
    messages: [
      { id: nextId('msg'), author: 'applicant', text: firstMessage, sentAt: now() },
      {
        id: nextId('msg'),
        author: 'host',
        text: '応募ありがとうございます!内容を確認して折り返しご連絡しますね。',
        sentAt: now(),
      },
    ],
  };
  store.update((current) => [thread, ...current]);
  return thread;
}

/** やりとりにメッセージを追加する */
export function sendMessage(threadId: string, text: string): void {
  const message = { id: nextId('msg'), author: 'applicant' as const, text, sentAt: now() };
  store.update((current) =>
    current.map((t) =>
      t.id === threadId ? { ...t, messages: [...t.messages, message] } : t,
    ),
  );
}
