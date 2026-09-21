import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Brand, MaxPhoneWidth, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { fetchLocations } from '@/data/location-store';
import type { Location } from '@/domain/location';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (venue: Location) => void;
}

/** 会場を検索して候補から選ぶボトムシート(本番は場所検索APIに置き換える想定) */
export function VenueSheet({ visible, onClose, onSelect }: Props) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [query, setQuery] = useState('');
  const venues = fetchLocations();

  // 開くたびに検索をリセット
  useEffect(() => {
    if (visible) setQuery('');
  }, [visible]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return venues;
    return venues.filter(
      (v) => v.name.includes(q) || v.ward.includes(q) || v.prefecture.includes(q),
    );
  }, [query, venues]);

  const select = (venue: Location) => {
    onSelect(venue);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>会場を選ぶ</Text>

          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="会場名・エリアで検索(全国)"
              placeholderTextColor={colors.textSecondary}
              style={styles.searchInput}
              autoFocus
            />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {results.map((v) => (
              <Pressable
                key={v.id}
                onPress={() => select(v)}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                <Ionicons name="location-outline" size={16} color={Brand.primary} />
                <View style={styles.rowBody}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {v.name}
                  </Text>
                  <Text style={styles.rowWard}>
                    {v.prefecture}・{v.ward}
                  </Text>
                </View>
              </Pressable>
            ))}

            {results.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>候補が見つかりませんでした</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetWrap: {
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    sheet: {
      width: '100%',
      maxWidth: MaxPhoneWidth,
      height: '75%',
      backgroundColor: c.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: Spacing.two,
    },
    handle: {
      alignSelf: 'center',
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: c.backgroundSelected,
    },
    title: {
      fontSize: 16,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
      paddingVertical: Spacing.two,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      marginHorizontal: Spacing.three,
      marginBottom: Spacing.two,
      height: 38,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: c.text,
      paddingVertical: 0,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    rowPressed: {
      opacity: 0.6,
    },
    rowBody: {
      flex: 1,
      gap: 1,
    },
    rowName: {
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
    },
    rowWard: {
      fontSize: 11,
      color: c.textSecondary,
    },
    empty: {
      paddingTop: Spacing.five,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 12,
      color: c.textSecondary,
    },
  });
