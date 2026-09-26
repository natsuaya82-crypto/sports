import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  getOpportunityKindLabel,
  SUPPORTED_OPPORTUNITY_KINDS,
  type OpportunityKind,
} from '@/domain/opportunity';
import { useThemedStyles } from '@/ui/contexts/theme-context';

import {
  makeEditFieldStyles,
  makeEditFormStyles,
  type TeamEditFormProps,
} from './edit-form';
import { SelectableChip } from '@/ui/components/SelectableChip';

import { TeamFormScaffold } from './TeamFormScaffold';

/** 募集種別 */
export function TeamRecruitingForm({ team, onSave }: TeamEditFormProps) {
  const styles = useThemedStyles(makeEditFieldStyles);
  const form = useThemedStyles(makeEditFormStyles);
  const [recruitingKinds, setRecruitingKinds] = useState<OpportunityKind[]>(
    team.recruitingKinds,
  );

  const toggle = (t: OpportunityKind) => {
    setRecruitingKinds((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t],
    );
  };

  return (
    <TeamFormScaffold
      canSave
      color={team.color}
      onSave={() => onSave({ recruitingKinds })}>
      <Text style={form.sectionHint}>
        サイトの募集ページとチーム検索のカードに表示されます
      </Text>
      <View style={styles.chipRow}>
        {SUPPORTED_OPPORTUNITY_KINDS.map((t) => (
          <SelectableChip
            key={t}
            label={getOpportunityKindLabel(t)}
            selected={recruitingKinds.includes(t)}
            onPress={() => toggle(t)}
          />
        ))}
      </View>
    </TeamFormScaffold>
  );
}
