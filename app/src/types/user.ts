import type { Level, Sport } from '@/types/recruitment';

/** アカウント(1人1つ)。個人LPの情報を兼ねる */
export interface UserAccount {
  id: string;
  displayName: string;
  avatar: string;
  ward: string;
  bio: string;
  /** やっている種目 */
  sports: Sport[];
  level: Level;
  /** 管理しているチームのID(代表・管理者) */
  managedTeamIds: string[];
}

/** マイページで「誰として使うか」 */
export type ActingAs = { kind: 'personal' } | { kind: 'team'; teamId: string };
