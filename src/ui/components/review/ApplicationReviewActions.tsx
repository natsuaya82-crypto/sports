import { Alert, StyleSheet, View } from 'react-native';

import { acceptApplication, recordAttendance, type ReviewResult } from '@/data/application-review';
import { canAccept, type Application } from '@/domain/application';
import type { Opportunity } from '@/domain/opportunity';
import {
  canRecordAttendance,
  type AttendanceStatus,
} from '@/domain/participation';
import { SelectableChip } from '@/ui/components/SelectableChip';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand, Palette, Spacing } from '@/ui/theme';

interface Props {
  application: Application;
  opportunity: Opportunity;
  /** この応募の最新の出欠。未記録なら undefined */
  attendance: AttendanceStatus | undefined;
  /** 今日の日付（`YYYY-MM-DD`）。開催日を過ぎたかの判定に渡す */
  today: string;
}

/** 操作が断られたときは理由をそのまま見せる */
function showIfRejected(result: ReviewResult) {
  if (!result.ok) Alert.alert(result.reason);
}

/**
 * 応募者の確認画面の1行に付ける主催者の操作（docs/DOMAIN.md 9.2 / 9.3）。
 *
 * - 検討中 → 受理（満員なら押せない）
 * - 受理済みで開催日を過ぎた → 出席 / 欠席（付け直し可）
 *
 * 出せるかどうかは domain の判定だけで決め、ここでは計算しない。
 */
export function ApplicationReviewActions({
  application,
  opportunity,
  attendance,
  today,
}: Props) {
  const styles = useThemedStyles(makeStyles);

  if (application.status === 'pending') {
    const acceptable = canAccept(application, opportunity);
    return (
      <View style={styles.actions}>
        <SelectableChip
          label="受理する"
          selected={acceptable}
          style={!acceptable && styles.disabled}
          onPress={() => {
            if (acceptable) showIfRejected(acceptApplication(application.id));
          }}
        />
      </View>
    );
  }

  if (!canRecordAttendance(application, opportunity, today)) return null;

  const record = (status: AttendanceStatus) =>
    showIfRejected(recordAttendance(application.id, status, today));
  return (
    <View style={styles.actions}>
      <SelectableChip
        label="出席"
        selected={attendance === 'attended'}
        onPress={() => record('attended')}
      />
      <SelectableChip
        label="欠席"
        selected={attendance === 'no_show'}
        color={Brand.danger}
        onPress={() => record('no_show')}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    actions: { flexDirection: 'row', gap: Spacing.two, paddingTop: Spacing.one },
    /** 押せない状態。募集詳細の応募ボタン（締切時）と同じ塗り */
    disabled: { backgroundColor: c.backgroundSelected },
  });
