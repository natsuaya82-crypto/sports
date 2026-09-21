import type { Team } from '@/domain/team';

/** サイト内のページ */
export type SiteTab =
  | 'top'
  | 'news'
  | 'schedule'
  | 'members'
  | 'recruit'
  | 'results'
  | 'gallery'
  | 'about';

export interface SiteTabItem {
  key: SiteTab;
  label: string;
}

/** 中身があるページだけメニューに出す */
export function getSiteTabs(team: Team): SiteTabItem[] {
  return [
    { key: 'top', label: 'TOP' },
    ...(team.news?.length ? [{ key: 'news' as const, label: 'お知らせ' }] : []),
    ...(team.matches?.length ? [{ key: 'schedule' as const, label: '日程・結果' }] : []),
    ...(team.roster?.length ? [{ key: 'members' as const, label: 'メンバー' }] : []),
    { key: 'recruit' as const, label: '募集' },
    ...(team.achievements?.length ? [{ key: 'results' as const, label: '戦績' }] : []),
    ...(team.gallery.length ? [{ key: 'gallery' as const, label: 'フォト' }] : []),
    { key: 'about' as const, label: 'チーム情報' },
  ];
}
