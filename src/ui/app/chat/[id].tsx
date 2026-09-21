import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NotFoundScreen } from '@/ui/components/NotFoundScreen';
import { Screen } from '@/ui/components/Screen';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications, useMessageThreads } from '@/ui/hooks/use-applications';
import { useOpportunity } from '@/ui/hooks/use-opportunities';
import { sendMessage } from '@/data/message-store';

/** 応募のやりとり(チャット) */
export default function ChatScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const application = useApplications().find((a) => a.id === id);
  const thread = useMessageThreads().find((t) => t.applicationId === id);
  const opportunity = useOpportunity(application?.opportunityId);
  const [draft, setDraft] = useState('');

  if (application === undefined || thread === undefined || opportunity === undefined) {
    return (
      <NotFoundScreen message="やりとりが見つかりませんでした" />
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(thread.id, text);
    setDraft('');
  };

  return (
    <Screen>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {opportunity.hostTeamName}
          </Text>
          <Text style={styles.headerSub} numberOfLines={1}>
            {opportunity.title}
          </Text>
        </View>
        <View style={styles.headerSide} />
      </View>

      {/* メッセージ */}
      <ScrollView
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}>
        {thread.messages.map((m) => (
          <View
            key={m.id}
            style={[
              styles.bubble,
              m.author === 'applicant' ? styles.bubbleMe : styles.bubbleTeam,
            ]}>
            <Text style={[styles.bubbleText, m.author === 'applicant' && styles.bubbleTextMe]}>
              {m.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* 入力欄 */}
      <View style={styles.inputBar}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="メッセージを入力"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          onSubmitEditing={send}
        />
        <Pressable
          onPress={send}
          style={[styles.sendButton, !draft.trim() && styles.sendDisabled]}>
          <Ionicons name="arrow-up" size={18} color={Brand.onPrimary} />
        </Pressable>
      </View>
    </Screen>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
      gap: Spacing.two,
    },
    headerSide: {
      width: 28,
      alignItems: 'flex-start',
    },
    headerCenter: {
      flex: 1,
      alignItems: 'center',
      gap: 1,
    },
    headerTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    headerSub: {
      fontSize: 10,
      color: c.textSecondary,
    },
    messages: {
      flex: 1,
    },
    messagesContent: {
      padding: Spacing.three,
      gap: Spacing.two,
    },
    bubble: {
      maxWidth: '78%',
      borderRadius: 16,
      paddingHorizontal: Spacing.two,
      paddingVertical: 9,
    },
    bubbleMe: {
      alignSelf: 'flex-end',
      backgroundColor: Brand.primary,
      borderBottomRightRadius: 4,
    },
    bubbleTeam: {
      alignSelf: 'flex-start',
      backgroundColor: c.backgroundElement,
      borderBottomLeftRadius: 4,
    },
    bubbleText: {
      fontSize: 13,
      lineHeight: 19,
      color: c.text,
    },
    bubbleTextMe: {
      color: Brand.onPrimary,
    },
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      padding: Spacing.two,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    input: {
      flex: 1,
      backgroundColor: c.backgroundElement,
      borderRadius: 999,
      paddingHorizontal: Spacing.three,
      paddingVertical: 10,
      fontSize: 13,
      color: c.text,
    },
    sendButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Brand.primary,
    },
    sendDisabled: {
      opacity: 0.4,
    },
  });
