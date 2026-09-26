import type { User } from '@/domain/user';

import { USER_SEEDS } from './user-seed';

/**
 * デモアカウント。ワンタップでモックデータの入った状態に入れる。
 * パスワードはモック段階のため平文。Supabase Auth導入時にこのファイルごと消える。
 */
export const DEMO_EMAIL = 'demo@spomatch.app';
export const DEMO_PASSWORD = 'demo';

export const DEMO_USER: User = USER_SEEDS[0];
