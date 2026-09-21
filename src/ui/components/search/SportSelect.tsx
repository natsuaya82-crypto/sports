import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import { Brand, MaxPhoneWidth, Palette, Spacing } from '@/ui/theme';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { SPORTS, Sport, getSportLabel } from '@/domain/sport';

interface ButtonProps {
  /** null = すべての競技 */
  selected: Sport | null;
  onPress: () => void;
}

/** エリアバーの横に置く競技プルダウンボタン */
export function SportSelectButton({ selected, onPress }: ButtonProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected !== null && styles.buttonActive,
        pressed && styles.pressed,
      ]}>
      {selected !== null ? (
        <SportIcon sport={selected} size={14} color={Brand.onPrimary} />
      ) : (
        <Ionicons name="basketball-outline" size={14} color={colors.text} />
      )}
      <Text style={[styles.label, selected !== null && styles.labelActive]} numberOfLines={1}>
        {selected !== null ? getSportLabel(selected) : '競技'}
      </Text>
      <Ionicons
        name="chevron-down"
        size={14}
        color={selected !== null ? Brand.onPrimary : colors.textSecondary}
      />
    </Pressable>
  );
}

interface SheetProps {
  visible: boolean;
  selected: Sport | null;
  onClose: () => void;
  onSelect: (sport: Sport | null) => void;
}

/** 競技選択シート(タップで即適用) */
export function SportSheet({ visible, selected, onClose, onSelect }: SheetProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);

  const pick = (sport: Sport | null) => {
    onSelect(sport);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>競技をえらぶ</Text>

          <Row
            label="すべての競技"
            icon={<Ionicons name="apps-outline" size={18} color={colors.text} />}
            selected={selected === null}
            onPress={() => pick(null)}
          />
          {SPORTS.map((s) => (
            <Row
              key={s}
              label={getSportLabel(s)}
              icon={<SportIcon sport={s} size={18} color={colors.text} />}
              selected={selected === s}
              onPress={() => pick(s)}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

function Row({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  selected: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.row, selected && styles.rowSelected]}>
      {icon}
      <Text style={styles.rowLabel}>{label}</Text>
      {selected && <Ionicons name="checkmark-circle" size={20} color={Brand.primary} />}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 12,
    },
    buttonActive: {
      backgroundColor: Brand.primary,
    },
    pressed: {
      opacity: 0.7,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: c.text,
      maxWidth: 88,
    },
    labelActive: {
      color: Brand.onPrimary,
      fontWeight: '700',
    },
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
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      paddingVertical: 12,
      paddingHorizontal: Spacing.two,
      borderRadius: 10,
    },
    rowSelected: {
      backgroundColor: c.primarySoft,
    },
    rowLabel: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
  });
