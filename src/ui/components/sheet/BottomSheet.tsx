import type { ReactNode } from 'react';
import { DimensionValue, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { MaxPhoneWidth, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  visible: boolean;
  /** シート上部の中央に出すタイトル */
  title: string;
  onClose: () => void;
  /**
   * 高さ上限。画面ごとに異なる（エリア/絞りこみは85%、選択肢は60%）。
   * 省略時は中身の高さに合わせる。
   */
  maxHeight?: DimensionValue;
  /** 高さを固定する画面（会場検索）用。中身の量で高さを変えたくない場合に使う */
  height?: DimensionValue;
  children: ReactNode;
  /** 本文の下に固定表示する操作列。フッターを持たない画面もある */
  footer?: ReactNode;
}

/**
 * ボトムシートの共通枠。
 * 背景オーバーレイ・ハンドル・タイトル行までを持ち、本文とフッターは呼び出し側が渡す。
 * 高さの扱いだけは画面ごとに違うため props で出し分ける。
 */
export function BottomSheet({
  visible,
  title,
  onClose,
  maxHeight,
  height,
  children,
  footer,
}: Props) {
  const styles = useThemedStyles(makeStyles);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={[styles.sheet, { maxHeight, height }]}>
          <View style={styles.handle} />
          <Text style={styles.title}>{title}</Text>
          {children}
          {footer}
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
  });
