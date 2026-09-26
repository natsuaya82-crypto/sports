import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SearchField } from '@/ui/components/search/SearchField';
import { BottomSheet } from '@/ui/components/sheet/BottomSheet';
import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';
import { fetchLocations } from '@/data/location-store';
import type { Location } from '@/domain/location';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (venue: Location) => void;
}

/** 会場を検索して候補から選ぶボトムシート(本番は場所検索APIに置き換える想定) */
export function VenueSheet({ visible, onClose, onSelect }: Props) {
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
    <BottomSheet visible={visible} title="会場を選ぶ" onClose={onClose} height="75%">
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="会場名・エリアで検索(全国)"
        autoFocus
        style={styles.searchBar}
      />

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
    </BottomSheet>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    searchBar: {
      marginBottom: Spacing.two,
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
