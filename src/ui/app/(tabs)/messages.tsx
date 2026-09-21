import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ShieldIcon } from '@/ui/components/Icons';
import { Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Application, useApplications } from '@/data/application-store';

/** メッセージタブ: 応募のやりとり一覧 */
export default function MessagesScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const applications = useApplications();

  const renderItem = ({ item }: { item: Application }) => {
    const last = item.messages[item.messages.length - 1];
    return (
      <Pressable
        style={styles.row}
        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id } })}>
        <View style={styles.avatar}>
          <ShieldIcon size={18} color={colors.textSecondary} />
        </View>
        <View style={styles.rowBody}>
          <Text style={styles.rowName} numberOfLines={1}>
            {item.teamName}
          </Text>
          <Text style={styles.rowPreview} numberOfLines={1}>
            {last ? `${last.from === 'me' ? 'あなた: ' : ''}${last.text}` : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.screenTitle}>メッセージ</Text>
      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
