import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';

interface Toggle {
  key: string;
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  initial: boolean;
}

const GROUPS: { title: string; items: Toggle[] }[] = [
  {
    title: '募集・応募',
    items: [
      {
        key: 'newRecruit',
        label: '近くの新しい募集',
        desc: '選択エリアで新しい募集が出たら通知',
        icon: 'megaphone-outline',
        initial: true,
      },
      {
        key: 'applyReply',
        label: '応募への返信',
        desc: '応募したチームから返信が来たら通知',
        icon: 'chatbubble-ellipses-outline',
        initial: true,
      },
      {
        key: 'scout',
        label: 'スカウト',
        desc: 'チームからスカウトが届いたら通知',
        icon: 'send-outline',
        initial: true,
      },
    ],
  },
  {
    title: 'チーム運営',
    items: [
      {
        key: 'newApplicant',
        label: '新しい応募者',
        desc: '自分のチームに応募が来たら通知',
        icon: 'mail-open-outline',
        initial: true,
      },
      {
        key: 'reminder',
        label: '活動前リマインド',
        desc: '参加予定の前日にお知らせ',
        icon: 'alarm-outline',
        initial: false,
      },
    ],
  },
];

/** 通知設定 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  const [state, setState] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const g of GROUPS) for (const i of g.items) init[i.key] = i.initial;
    return init;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Ionicons
          name="chevron-back"
          size={22}
          color={colors.text}
          onPress={() => router.back()}
          style={styles.back}
        />
        <Text style={styles.headerTitle}>通知設定</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {GROUPS.map((g) => (
          <View key={g.title} style={styles.group}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={styles.list}>
              {g.items.map((item, i) => (
                <View
                  key={item.key}
                  style={[styles.row, i === g.items.length - 1 && styles.rowLast]}>
                  <Ionicons name={item.icon} size={18} color={colors.textSecondary} />
                  <View style={styles.rowBody}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowDesc}>{item.desc}</Text>
                  </View>
                  <Switch
                    value={state[item.key]}
                    onValueChange={(v) => setState((s) => ({ ...s, [item.key]: v }))}
                    trackColor={{ true: Brand.primary }}
                    thumbColor="#ffffff"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    back: { width: 32 },
    headerTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    content: { padding: Spacing.three, gap: Spacing.three },
    group: { gap: Spacing.two },
    groupTitle: { fontSize: 12, fontWeight: '700', color: c.textSecondary },
    list: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 12,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.three,
      paddingVertical: 13,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowLast: { borderBottomWidth: 0 },
    rowBody: { flex: 1, gap: 1 },
    rowLabel: { fontSize: 13, fontWeight: '700', color: c.text },
    rowDesc: { fontSize: 11, color: c.textSecondary },
  });
