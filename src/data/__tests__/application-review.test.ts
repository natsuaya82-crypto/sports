import { getRemainingCapacity } from '@/domain/opportunity';
import { getAttendanceOf } from '@/domain/participation';
import { getDateFromToday } from '@/lib/local-date';

import { acceptApplication, recordAttendance } from '../application-review';
import { applicationStore , createApplication } from '../application-store';
import { opportunityStore } from '../opportunity-store';
import { participationStore } from '../participation-store';

const opportunityOf = (id: string) => {
  const found = opportunityStore.getSnapshot().find((o) => o.id === id);
  if (found === undefined) throw new Error(`opportunity ${id} not found`);
  return found;
};

describe('受理すると残り枠が減る（docs/DOMAIN.md 9.3）', () => {
  it('カウンタを更新しなくても、応募の状態から数え直される', () => {
    // r1: 定員3 / アプリ外で1人確保済み / 受理済み0
    const before = getRemainingCapacity(opportunityOf('r1'));
    const result = acceptApplication('a1');
    expect(result.ok).toBe(true);
    expect(getRemainingCapacity(opportunityOf('r1'))).toBe(before - 1);
  });

  it('定員を超えて受理できない', () => {
    // r1 の残りを受理で埋めきる
    let remaining = getRemainingCapacity(opportunityOf('r1'));
    let n = 0;
    while (remaining > 0) {
      const app = createApplication({
        opportunityId: 'r1',
        applicantUserId: `filler-${n}`,
        applicantTeamId: null,
        message: '',
      });
      expect(acceptApplication(app.id).ok).toBe(true);
      remaining = getRemainingCapacity(opportunityOf('r1'));
      n += 1;
    }
    const overflow = createApplication({
      opportunityId: 'r1',
      applicantUserId: 'overflow',
      applicantTeamId: null,
      message: '',
    });
    expect(acceptApplication(overflow.id).ok).toBe(false);
  });

  it('購読している画面は同じ参照を受け取り続けない（変更が届く）', () => {
    const before = opportunityStore.getSnapshot();
    const app = createApplication({
      opportunityId: 'r2',
      applicantUserId: 'watcher',
      applicantTeamId: null,
      message: '',
    });
    acceptApplication(app.id);
    expect(opportunityStore.getSnapshot()).not.toBe(before);
  });
});

describe('出欠の記録', () => {
  const today = getDateFromToday(0);

  it('開催前の募集には記録できない', () => {
    // a5: r5（明日開催）に受理済み
    const result = recordAttendance('a5', 'attended', today);
    expect(result.ok).toBe(false);
  });

  it('開催日を過ぎていれば記録でき、履歴に追記される', () => {
    const future = getDateFromToday(30);
    const before = participationStore.getSnapshot().length;
    expect(recordAttendance('a5', 'attended', future).ok).toBe(true);
    expect(participationStore.getSnapshot()).toHaveLength(before + 1);
    expect(getAttendanceOf(participationStore.getSnapshot(), 'a5')).toBe('attended');
  });

  it('付け直すと最新の記録が有効になる', () => {
    const later = getDateFromToday(31);
    recordAttendance('a5', 'no_show', later);
    expect(getAttendanceOf(participationStore.getSnapshot(), 'a5')).toBe('no_show');
  });

  it('受理していない応募には記録できない', () => {
    const pending = applicationStore.getSnapshot().find((a) => a.status === 'pending');
    if (pending === undefined) throw new Error('pending application not found');
    expect(recordAttendance(pending.id, 'attended', getDateFromToday(60)).ok).toBe(false);
  });
});
