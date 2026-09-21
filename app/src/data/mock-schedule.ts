import type { RecruitmentType, Sport } from '@/types/recruitment';

/** 参加予定(応募が受理された・参加確定したイベント) */
export interface ScheduleEntry {
  id: string;
  /** 元になった募集ID(あれば詳細に飛べる) */
  recruitmentId?: string;
  sport: Sport;
  type: RecruitmentType;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  startTime: string;
  endTime: string;
  venueName: string;
  teamName: string;
  status: 'confirmed' | 'pending';
}

function dateFromToday(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** ログインユーザーの参加予定(モック) */
export const mockSchedule: ScheduleEntry[] = [
  {
    id: 's1',
    recruitmentId: 'r5',
    sport: 'soccer',
    type: 'helper',
    title: '【朝活】7人制ソサイチ助っ人FW募集',
    date: dateFromToday(1),
    startTime: '07:00',
    endTime: '09:00',
    venueName: '駒沢オリンピック公園',
    teamName: '朝ソサイチ駒沢',
    status: 'confirmed',
  },
  {
    id: 's2',
    recruitmentId: 'r11',
    sport: 'running',
    type: 'trial',
    title: '皇居ラン 一緒に走りましょう(キロ6分)',
    date: dateFromToday(4),
    startTime: '19:30',
    endTime: '21:00',
    venueName: '皇居外周',
    teamName: '皇居ランナーズ',
    status: 'confirmed',
  },
  {
    id: 's3',
    recruitmentId: 'r9',
    sport: 'basketball',
    type: 'trial',
    title: '日曜午後ゆるバスケ!ブランク歓迎',
    date: dateFromToday(3),
    startTime: '13:00',
    endTime: '16:00',
    venueName: '世田谷総合運動場体育館',
    teamName: 'せたバス',
    status: 'pending',
  },
];
