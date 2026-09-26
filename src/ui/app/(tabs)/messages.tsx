import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { ScreenTitle } from '@/ui/components/list/ScreenTitle';
import { Screen } from '@/ui/components/Screen';
import { ShieldIcon } from '@/ui/components/Icons';
import { ListEmptyState } from '@/ui/components/ListEmptyState';
import { ListRow, ListRowBody, ListRowChevron } from '@/ui/components/list/ListRow';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { useApplications, useMessageThreads } from '@/ui/hooks/use-applications';
import { useOpportunity } from '@/ui/hooks/use-opportunities';
import { getLastMessage, type MessageThread } from '@/domain/message';

/** メッセージタブ: 応募のやりとり一覧 */
export default function MessagesScreen() {
  const styles = useThemedStyles(makeStyles);
  const threads = useMessageThreads();

  return (
    <Screen>
      <ScreenTitle title="メッセージ" style={styles.screenTitle} />
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThreadRow thread={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <ListEmptyState
            title="まだやりとりがありません"
            hint="募集に応募すると、ここでやりとりできます"
          />
        }
      />
    </Screen>
  );
}

/**
 * やりとり1件の行。
 * 相手の表示名は応募先のOpportunityから引く(やりとり側で控えを持たない)。
 */
function ThreadRow({ thread }: { thread: MessageThread }) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const application = useApplications().find((a) => a.id === thread.applicationId);
  const opportunity = useOpportunity(application?.opportunityId);
  if (opportunity === undefined) return null;

  const last = getLastMessage(thread);
  return (
    <ListRow
      onPress={() =>
        router.push({ pathname: '/chat/[id]', params: { id: thread.applicationId } })
      }>
      <View style={styles.avatar}>
        <ShieldIcon size={18} color={colors.textSecondary} />
      </View>
      <ListRowBody gap={2}>
        <Text style={styles.rowName} numberOfLines={1}>
          {opportunity.hostTeamName}
        </Text>
        <Text style={styles.rowPreview} numberOfLines={1}>
          {last ? `${last.author === 'applicant' ? 'あなた: ' : ''}${last.text}` : ''}
        </Text>
      </ListRowBody>
      <ListRowChevron />
    </ListRow>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screenTitle: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.two,
    },
    listContent: {
      paddingHorizontal: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 88,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    rowName: {
      fontSize: 13,
      fontWeight: '700',
      color: c.text,
    },
    rowPreview: {
      fontSize: 11,
      color: c.textSecondary,
    },
  });
