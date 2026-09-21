import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShieldIcon } from '@/ui/components/Icons';
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.screenTitle}>メッセージ</Text>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ThreadRow thread={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>まだやりとりがありません</Text>
            <Text style={styles.emptyHint}>募集に応募すると、ここでやりとりできます</Text>
          </View>
        }
      />
    </SafeAreaView>
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
    <Pressable
      style={styles.row}
      onPress={() =>
        router.push({ pathname: '/chat/[id]', params: { id: thread.applicationId } })
      }>
      <View style={styles.avatar}>
        <ShieldIcon size={18} color={colors.textSecondary} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>
          {opportunity.hostTeamName}
        </Text>
        <Text style={styles.rowPreview} numberOfLines={1}>
          {last ? `${last.author === 'applicant' ? 'あなた: ' : ''}${last.text}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    screenTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.two,
    },
    listContent: {
      paddingHorizontal: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 88,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
      padding: Spacing.two,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    rowBody: {
      flex: 1,
      gap: 2,
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
    empty: {
      alignItems: 'center',
      paddingTop: 80,
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    emptyHint: {
      fontSize: 12,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
