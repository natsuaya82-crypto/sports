import type { Level, RecruitmentType, Sport } from '@/types/recruitment';

/**
 * 個人(スカウト対象・個人の公開プロフィール)。
 * 企画書の個人LP項目: ポジション・プレースタイル・レベル感、
 * 活動可能エリア/曜日、希望する参加形態、経歴。
 */
export interface Person {
  id: string;
  name: string;
  avatar: string;
  ward: string;
  /** メイン競技 */
  sport: Sport;
  /** その他やる競技 */
  otherSports?: Sport[];
  level: Level;
  /** 例: '20代' */
  age?: string;
  /** ポジション(例: 'MF / FW') */
  position?: string;
  /** プレースタイル */
  playStyle: string;
  /** 経歴 */
  experience: string;
  /** 活動可能な曜日・時間帯 */
  availability: string;
  /** 希望する参加形態 */
  wantedForms: RecruitmentType[];
  bio: string;
}
