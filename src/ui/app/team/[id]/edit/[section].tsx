import { useLocalSearchParams, useRouter } from 'expo-router';

import { updateTeam } from '@/data/team-store';
import type { Team } from '@/domain/team';
import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { Screen } from '@/ui/components/Screen';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { TeamAchievementsForm } from '@/ui/components/team/TeamAchievementsForm';
import { TeamActivityForm } from '@/ui/components/team/TeamActivityForm';
import { TeamBasicForm } from '@/ui/components/team/TeamBasicForm';
import { TeamColorForm } from '@/ui/components/team/TeamColorForm';
import { TeamNewsForm } from '@/ui/components/team/TeamNewsForm';
import { TeamRecruitingForm } from '@/ui/components/team/TeamRecruitingForm';
import { useTeam } from '@/ui/hooks/use-teams';

/** 編集画面のセクション */
export type EditSection =
  | 'basic'
  | 'color'
  | 'activity'
  | 'recruiting'
  | 'news'
  | 'achievements';

const SECTION_TITLES: Record<EditSection, string> = {
  basic: '基本情報',
  color: 'チームカラー',
  activity: '活動情報',
  recruiting: '募集している種別',
  news: 'お知らせ',
  achievements: '出場大会・戦績',
};

/** 項目ごとの編集画面(編集メニューから遷移) */
export default function TeamEditSectionScreen() {
  const router = useRouter();
  const { id, section } = useLocalSearchParams<{ id: string; section: EditSection }>();
  const team = useTeam(id);

  if (!team || !section || !(section in SECTION_TITLES)) {
    return (
      <NotFoundScreen message="ページが見つかりませんでした" />
    );
  }

  const save = (patch: Partial<Omit<Team, 'id'>>) => {
    updateTeam(team.id, patch);
    router.back();
  };

  return (
    <Screen>
      <ScreenHeader title={SECTION_TITLES[section]} />

      {section === 'basic' && <TeamBasicForm team={team} onSave={save} />}
      {section === 'color' && <TeamColorForm team={team} onSave={save} />}
      {section === 'activity' && <TeamActivityForm team={team} onSave={save} />}
      {section === 'recruiting' && <TeamRecruitingForm team={team} onSave={save} />}
      {section === 'news' && <TeamNewsForm team={team} onSave={save} />}
      {section === 'achievements' && <TeamAchievementsForm team={team} onSave={save} />}
    </Screen>
  );
}
