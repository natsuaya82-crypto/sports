import { WEEKDAYS } from '@/lib/local-date';
import { useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

/** マスは正方形固定。中身は固定フォントなので絶対にはみ出さない */
const CELL_SIZE = 50;

interface Props {
  /** YYYY-MM-DD の配列(先頭が今日) */
  dates: string[];
  selected: string;
  onSelect: (date: string) => void;
}

function parseDate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 日付ストリップ(横スクロール・正方形マス) */
export function DateStrip({ dates, selected, onSelect }: Props) {
  const styles = useThemedStyles(makeStyles);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useRef(0);
  const drag = useRef<{ startClientX: number; startScrollX: number } | null>(null);

  // Webの横ScrollViewはマウスドラッグでスクロールできないので、
  // DOMのマウスイベントを拾ってscrollToに変換する(タッチ環境は素のスクロールが効く)
  const webDragHandlers =
    Platform.OS === 'web'
      ? {
          onMouseDown: (e: { clientX: number }) => {
            drag.current = { startClientX: e.clientX, startScrollX: scrollX.current };
          },
          onMouseMove: (e: { clientX: number }) => {
            if (!drag.current) return;
            const dx = e.clientX - drag.current.startClientX;
            scrollRef.current?.scrollTo({
              x: drag.current.startScrollX - dx,
              animated: false,
            });
          },
          onMouseUp: () => {
            drag.current = null;
          },
          onMouseLeave: () => {
            drag.current = null;
          },
        }
      : {};

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.current = e.nativeEvent.contentOffset.x;
  };

  return (
    // ScrollViewはresponder系propsを内部で上書きするため、ドラッグはラッパーで拾う
    <View style={styles.strip} {...(webDragHandlers as object)}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.container}>
      {dates.map((date, index) => {
        const d = parseDate(date);
        const weekday = d.getDay();
        const isSelected = date === selected;
        const weekdayColor =
          weekday === 0 ? Brand.danger : weekday === 6 ? Brand.info : undefined;
        // 先頭が今日である前提(propsのdatesは今日始まり)
        const dayLabel = index === 0 ? '今日' : index === 1 ? '明日' : String(d.getDate());
        const isWordLabel = index <= 1;

        return (
          <Pressable
            key={date}
            onPress={() => onSelect(date)}
            style={[styles.cell, isSelected && styles.cellSelected]}>
            <Text
              style={[
                styles.day,
                isWordLabel && styles.dayWord,
                isSelected && styles.textSelected,
              ]}>
              {dayLabel}
            </Text>
            <Text
              style={[
                styles.weekday,
                weekdayColor != null && { color: weekdayColor },
                isSelected && styles.textSelected,
              ]}>
              {WEEKDAYS[weekday]}
            </Text>
          </Pressable>
        );
      })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    // ストリップ自体の高さを固定し、下の要素に潰されて欠けないようにする
    strip: {
      flexGrow: 0,
      flexShrink: 0,
      height: CELL_SIZE + Spacing.two * 2,
    },
    container: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      gap: 6,
    },
    cell: {
      width: CELL_SIZE,
      height: CELL_SIZE,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.backgroundElement,
    },
    cellSelected: {
      backgroundColor: Brand.primary,
    },
    day: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    // 「今日」「明日」は2文字なので少し小さくしてマスに収める
    dayWord: {
      fontSize: 13,
      lineHeight: 19,
    },
    weekday: {
      fontSize: 10,
      fontWeight: '600',
      color: c.textSecondary,
    },
    textSelected: {
      color: Brand.onPrimary,
    },
  });
