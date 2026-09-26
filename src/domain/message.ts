/**
 * 応募に紐づくやりとり。
 *
 * 応募（Application）とやりとりはライフサイクルが違う。応募が成立・不成立に
 * なった後もやりとりは残るため、同じモデルへ詰め込まない。
 */
/** 発言者。応募者側か、募集した側か */
type MessageAuthor = 'applicant' | 'host';


export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
  sentAt: string;
}

export interface MessageThread {
  id: string;
  applicationId: string;
  messages: Message[];
}

/** スレッド一覧に出す最後の1通。1通も無ければ undefined */
export function getLastMessage(thread: MessageThread): Message | undefined {
  return thread.messages[thread.messages.length - 1];
}
