import type { Application } from '@/domain/application';
import type { MessageThread } from '@/domain/message';
import { applicationStore } from '@/data/application-store';
import { messageThreadStore } from '@/data/message-store';

import { useStore } from './use-store';

/** 応募一覧 */
export function useApplications(): readonly Application[] {
  return useStore(applicationStore);
}

/** やりとりスレッド一覧 */
export function useMessageThreads(): readonly MessageThread[] {
  return useStore(messageThreadStore);
}
