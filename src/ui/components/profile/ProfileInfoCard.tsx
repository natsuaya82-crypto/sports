import { InfoCard, InfoRow } from '@/ui/components/list/InfoCard';
import { Spacing } from '@/ui/theme';
import type { User } from '@/domain/user';

/** 個人LPのラベル列の幅 */
const LABEL_WIDTH = 72;

/** 個人LPの詳細カード。未設定の項目は行ごと出さない */
export function ProfileInfoCard({ user }: { user: User }) {
  return (
    <InfoCard gap={12} marginTop={Spacing.one}>
      {user.position && (
        <InfoRow
          icon="location-outline"
          label="ポジション"
          value={user.position}
          labelWidth={LABEL_WIDTH}
          multiline
        />
      )}
      {user.playStyle && (
        <InfoRow
          icon="football-outline"
          label="プレー"
          value={user.playStyle}
          labelWidth={LABEL_WIDTH}
          multiline
        />
      )}
      {user.experience && (
        <InfoRow
          icon="ribbon-outline"
          label="経歴"
          value={user.experience}
          labelWidth={LABEL_WIDTH}
          multiline
        />
      )}
      {user.availability && (
        <InfoRow
          icon="time-outline"
          label="活動可能"
          value={user.availability}
          labelWidth={LABEL_WIDTH}
          multiline
        />
      )}
    </InfoCard>
  );
}
