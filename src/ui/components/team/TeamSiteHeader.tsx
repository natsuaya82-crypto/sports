import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Team } from '@/domain/team';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { Palette, Spacing } from '@/ui/theme';

import { makeSiteStyles } from './site-styles';
import { getSiteTabs, type SiteTab } from './site-tab';

/** サイトヘッダー(チームカラー)とサイトメニュー */
export function TeamSiteHeader({
  team,
  tab,
  onSelect,
  isDesktop,
}: {
  team: Team;
  tab: SiteTab;
  onSelect: (tab: SiteTab) => void;
  isDesktop: boolean;
}) {
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const site = useThemedStyles(makeSiteStyles);
  const tabs = getSiteTabs(team);

  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: team.color }}>
      <View style={[styles.siteHeader, site.innerWide, isDesktop && styles.siteHeaderDesktop]}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerBack}>
          <Ionicons name="chevron-back" size={isDesktop ? 24 : 20} color="#ffffff" />
        </Pressable>
        <View style={[styles.headerEmblem, isDesktop && styles.headerEmblemDesktop]}>
          <Image
            source={{ uri: team.photo }}
            style={styles.headerEmblemImage}
            contentFit="cover"
          />
        </View>
        <Text
          style={[styles.headerName, isDesktop && styles.headerNameDesktop]}
          numberOfLines={1}>
          {team.name}
        </Text>
        <Pressable hitSlop={8} style={styles.headerShare}>
          <Ionicons name="share-outline" size={isDesktop ? 22 : 18} color="#ffffff" />
        </Pressable>
      </View>

      {/* サイトメニュー */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={site.innerWide}
        contentContainerStyle={styles.menuRow}>
        {tabs.map((t) => {
          const active = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => onSelect(t.key)}
              style={[styles.menuItem, isDesktop && styles.menuItemDesktop]}>
              <Text
                style={[
                  styles.menuText,
                  isDesktop && styles.menuTextDesktop,
                  active && styles.menuTextActive,
                ]}>
                {t.label}
              </Text>
              <View style={[styles.menuUnderline, active && styles.menuUnderlineActive]} />
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (_c: Palette) =>
  StyleSheet.create({
    siteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
    },
    siteHeaderDesktop: {
      paddingVertical: 14,
      gap: Spacing.three,
    },
    headerBack: {
      width: 28,
      alignItems: 'center',
    },
    headerEmblem: {
      width: 30,
      height: 30,
      borderRadius: 15,
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255,255,255,0.8)',
    },
    headerEmblemDesktop: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    headerEmblemImage: {
      width: '100%',
      height: '100%',
    },
    headerName: {
      flex: 1,
      fontSize: 17,
      fontWeight: '800',
      color: '#ffffff',
    },
    headerNameDesktop: {
      fontSize: 22,
    },
    headerShare: {
      width: 28,
      alignItems: 'center',
    },
    menuRow: {
      paddingHorizontal: Spacing.two,
    },
    menuItem: {
      paddingHorizontal: Spacing.two,
      paddingTop: 4,
      alignItems: 'center',
      gap: 5,
    },
    menuItemDesktop: {
      paddingHorizontal: Spacing.three,
      gap: 7,
    },
    menuText: {
      fontSize: 13,
      fontWeight: '700',
      color: 'rgba(255,255,255,0.7)',
    },
    menuTextDesktop: {
      fontSize: 15,
    },
    menuTextActive: {
      color: '#ffffff',
    },
    menuUnderline: {
      alignSelf: 'stretch',
      height: 3,
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      backgroundColor: 'transparent',
    },
    menuUnderlineActive: {
      backgroundColor: '#ffffff',
    },
  });
