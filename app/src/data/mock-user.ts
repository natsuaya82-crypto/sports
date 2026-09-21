import type { UserAccount } from '@/types/user';

/** ログイン中ユーザーのモック */
export const mockUser: UserAccount = {
  id: 'u1',
  displayName: 'たなか なつ',
  avatar: 'https://picsum.photos/seed/avatar1/200/200',
  ward: '世田谷区',
  bio: '社会人からサッカー再開。週末に活動しています。',
  sports: ['soccer', 'futsal'],
  level: 'middle',
  managedTeamIds: ['t1', 't2'],
};
