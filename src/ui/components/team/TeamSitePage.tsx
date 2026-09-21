import type { Opportunity } from '@/domain/opportunity';
import type { Team } from '@/domain/team';

import type { SiteTab } from './site-tab';
import { TeamAboutPage } from './TeamAboutPage';
import { TeamGalleryPage } from './TeamGalleryPage';
import { TeamMembersPage } from './TeamMembersPage';
import { TeamNewsPage } from './TeamNewsPage';
import { TeamRecruitPage } from './TeamRecruitPage';
import { TeamResultsPage } from './TeamResultsPage';
import { TeamSchedulePage } from './TeamSchedulePage';
import { TeamTopPage } from './TeamTopPage';

/** メニューで選ばれているページを出す */
export function TeamSitePage({
  team,
  tab,
  opportunities,
  isDesktop,
  onNavigate,
}: {
  team: Team;
  tab: SiteTab;
  opportunities: Opportunity[];
  isDesktop: boolean;
  onNavigate: (tab: SiteTab) => void;
}) {
  switch (tab) {
    case 'top':
      return (
        <TeamTopPage
          team={team}
          opportunities={opportunities}
          onNavigate={onNavigate}
          isDesktop={isDesktop}
        />
      );
    case 'news':
      return <TeamNewsPage team={team} />;
    case 'schedule':
      return <TeamSchedulePage team={team} />;
    case 'members':
      return <TeamMembersPage team={team} isDesktop={isDesktop} />;
    case 'recruit':
      return <TeamRecruitPage team={team} opportunities={opportunities} />;
    case 'results':
      return <TeamResultsPage team={team} />;
    case 'gallery':
      return <TeamGalleryPage team={team} isDesktop={isDesktop} />;
    case 'about':
      return <TeamAboutPage team={team} />;
  }
}
