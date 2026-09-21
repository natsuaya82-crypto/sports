import { formatMonthDayWithWeekday } from '@/lib/local-date';

import { InfoCard, InfoRow } from '@/ui/components/list/InfoCard';
import { Spacing } from '@/ui/theme';
import {
  getEndTime,
  getOpportunityDate,
  getStartTime,
  isScheduled,
  type Opportunity,
} from '@/domain/opportunity';
import { getSportLabel } from '@/domain/sport';

/** 募集詳細のラベル列の幅 */
const LABEL_WIDTH = 56;

/**
 * 日時の表示文字列。日程未定の常設募集は行ごと出さないため null を返す。
 * 意味のない既定値で埋めない（docs/ARCHITECTURE.md 第11章）。
 */
function formatSchedule(opportunity: Opportunity): string | null {
  if (!isScheduled(opportunity)) return null;
  const date = getOpportunityDate(opportunity);
  if (date === null) return null;
  return `${formatMonthDayWithWeekday(date)} ${getStartTime(opportunity)}〜${getEndTime(opportunity)}`;
}

/** 募集詳細の開催情報 */
export function OpportunityInfoCard({ opportunity }: { opportunity: Opportunity }) {
  const schedule = formatSchedule(opportunity);

  return (
    <InfoCard gap={10} marginTop={Spacing.one}>
      {schedule !== null && (
        <InfoRow
          icon="calendar-outline"
          label="日時"
          value={schedule}
          labelWidth={LABEL_WIDTH}
        />
      )}
      <InfoRow
        icon="location-outline"
        label="場所"
        value={`${opportunity.location.name}(${opportunity.location.ward})`}
        labelWidth={LABEL_WIDTH}
      />
      <InfoRow
        icon="cash-outline"
        label="参加費"
        value={opportunity.fee === 0 ? '無料' : `¥${opportunity.fee.toLocaleString()}`}
        labelWidth={LABEL_WIDTH}
      />
      <InfoRow
        icon="pricetag-outline"
        label="競技"
        value={getSportLabel(opportunity.sport)}
        labelWidth={LABEL_WIDTH}
      />
      <InfoRow
        icon="people-outline"
        label="募集人数"
        value={`${opportunity.capacity}人(${opportunity.filledCount}人参加済み)`}
        labelWidth={LABEL_WIDTH}
      />
    </InfoCard>
  );
}
