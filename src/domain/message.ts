import { z } from 'zod';

/**
 * 応募に紐づくやりとり。
 *
 * 応募（Application）とやりとりはライフサイクルが違う。応募が成立・不成立に
 * なった後もやりとりは残るため、同じモデルへ詰め込まない。
 */
export const messageAuthorSchema = z.enum(['applicant', 'host']);

export type MessageAuthor = z.infer<typeof messageAuthorSchema>;

export const messageSchema = z.object({
  id: z.string(),
  author: messageAuthorSchema,
  text: z.string(),
  sentAt: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

export const messageThreadSchema = z.object({
  id: z.string(),
  applicationId: z.string(),
  messages: z.array(messageSchema),
});

export type MessageThread = z.infer<typeof messageThreadSchema>;

/** スレッド一覧に出す最後の1通。1通も無ければ undefined */
export function getLastMessage(thread: MessageThread): Message | undefined {
  return thread.messages[thread.messages.length - 1];
}
