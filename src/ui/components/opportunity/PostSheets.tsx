import { OptionSheet, SheetOption } from '@/ui/components/post/OptionSheet';
import { VenueSheet } from '@/ui/components/post/VenueSheet';
import type { Location } from '@/domain/location';

import {
  dateChipLabel,
  DURATIONS,
  feeLabel,
  FEES,
  START_TIMES,
  type PostSheetKey,
} from './PostFormOptions';

interface Props {
  openSheet: PostSheetKey | null;
  onCloseSheet: () => void;
  venueOpen: boolean;
  onCloseVenue: () => void;
  onSelectVenue: (venue: Location) => void;
  dates: string[];
  date: string;
  onSelectDate: (date: string) => void;
  startTime: string;
  onSelectStartTime: (startTime: string) => void;
  duration: number;
  onSelectDuration: (hours: number) => void;
  fee: number;
  onSelectFee: (fee: number) => void;
}

/** 募集作成フォームから開く選択シート一式 */
export function PostSheets(props: Props) {
  const { openSheet, onCloseSheet, dates } = props;

  return (
    <>
      <VenueSheet
        visible={props.venueOpen}
        onClose={props.onCloseVenue}
        onSelect={props.onSelectVenue}
      />
      <OptionSheet
        visible={openSheet === 'date'}
        title="日付"
        options={dates.map(
          (d, i): SheetOption<string> => ({ label: dateChipLabel(d, i), value: d }),
        )}
        selected={props.date}
        onSelect={props.onSelectDate}
        onClose={onCloseSheet}
      />
      <OptionSheet
        visible={openSheet === 'time'}
        title="開始時間"
        options={START_TIMES.map((t): SheetOption<string> => ({ label: t, value: t }))}
        selected={props.startTime}
        onSelect={props.onSelectStartTime}
        onClose={onCloseSheet}
      />
      <OptionSheet
        visible={openSheet === 'duration'}
        title="どれくらい"
        options={DURATIONS.map((d): SheetOption<number> => ({
          label: d.label,
          value: d.hours,
        }))}
        selected={props.duration}
        onSelect={props.onSelectDuration}
        onClose={onCloseSheet}
      />
      <OptionSheet
        visible={openSheet === 'fee'}
        title="参加費"
        options={FEES.map((f): SheetOption<number> => ({ label: feeLabel(f), value: f }))}
        selected={props.fee}
        onSelect={props.onSelectFee}
        onClose={onCloseSheet}
      />
    </>
  );
}
