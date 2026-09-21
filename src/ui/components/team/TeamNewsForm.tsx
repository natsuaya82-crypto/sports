import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, TextInput, Text, View } from 'react-native';

import type { TeamNews } from '@/domain/team';
import { getDateFromToday } from '@/lib/local-date';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Brand } from '@/ui/theme';

import { makeEditFormStyles, type TeamEditFormProps } from './edit-form';
import { TeamFormScaffold } from './TeamFormScaffold';

/** お知らせ */
export function TeamNewsForm({ team, onSave }: TeamEditFormProps) {
  const { colors } = useAppTheme();
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
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="例: リーグ戦 5-1で勝利!"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, styles.addInput]}
        />
        <Pressable
          onPress={add}
          style={[styles.addButton, !draft.trim() && styles.addButtonDisabled]}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>
      {news.length === 0 && <Text style={styles.sectionHint}>まだお知らせがありません</Text>}
      {news.map((n, i) => (
        <View key={`${n.date}-${n.text}`} style={styles.listRow}>
          <Text style={styles.listRowDate}>{n.date.slice(5).replace('-', '/')}</Text>
          <Text style={styles.listRowText} numberOfLines={2}>
            {n.text}
          </Text>
          <Pressable
            onPress={() => setNews((prev) => prev.filter((_, j) => j !== i))}
            hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={Brand.danger} />
          </Pressable>
        </View>
      ))}
    </TeamFormScaffold>
  );
}
