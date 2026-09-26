import { useState } from 'react';
import { Text, View } from 'react-native';

import type { TeamNews } from '@/domain/team';
import { getDateFromToday } from '@/lib/local-date';
import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeEditFormStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormAddRow, TeamFormDeleteButton } from './TeamFormAddRow';
import { TeamFormScaffold } from './TeamFormScaffold';

/** お知らせ */
export function TeamNewsForm({ team, onSave }: TeamEditFormProps) {
  const styles = useThemedStyles(makeEditFormStyles);
  const [news, setNews] = useState<TeamNews[]>(team.news ?? []);
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNews((prev) => [{ date: getDateFromToday(0), text }, ...prev]);
    setDraft('');
  };

  return (
    <TeamFormScaffold
      canSave
      color={team.color}
      onSave={() => onSave({ news: news.length > 0 ? news : undefined })}>
      <TeamFormAddRow
        value={draft}
        onChangeText={setDraft}
        placeholder="例: リーグ戦 5-1で勝利!"
        onAdd={add}
      />
      {news.length === 0 && <Text style={styles.sectionHint}>まだお知らせがありません</Text>}
      {news.map((n, i) => (
        <View key={`${n.date}-${n.text}`} style={styles.listRow}>
          <Text style={styles.listRowDate}>{n.date.slice(5).replace('-', '/')}</Text>
          <Text style={styles.listRowText} numberOfLines={2}>
            {n.text}
          </Text>
          <TeamFormDeleteButton
            onPress={() => setNews((prev) => prev.filter((_, j) => j !== i))}
          />
        </View>
      ))}
    </TeamFormScaffold>
  );
}
