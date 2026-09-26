import { addHoursToTime } from '@/lib/local-date';
import { Card, SelectorRow } from './PostFormParts';
import { durationLabel, type PostSheetKey } from './PostFormOptions';

interface Props {
  dateLabel: string;
  startTime: string;
  duration: number;
  onOpenSheet: (sheet: PostSheetKey) => void;
}

/** 募集作成: 日付・開始時間・所要時間 */
export function PostScheduleCard({
  dateLabel,
  startTime,
  duration,
  onOpenSheet,
}: Props) {
  return (
    <Card icon="calendar-outline" title="日時">
      <SelectorRow label="日付" value={dateLabel} onPress={() => onOpenSheet('date')} />
      <SelectorRow
        label="開始時間"
        value={startTime}
        onPress={() => onOpenSheet('time')}
      />
      <SelectorRow
        label="どれくらい"
        value={`${durationLabel(duration)}(〜${addHoursToTime(startTime, duration)})`}
        onPress={() => onOpenSheet('duration')}
      />
    </Card>
  );
}
