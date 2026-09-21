import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SportIcon } from '@/ui/components/Icons';
import { BottomSheet } from '@/ui/components/sheet/BottomSheet';
import { Brand, Palette, Spacing } from '@/ui/theme';
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
    <BottomSheet visible={visible} title="競技をえらぶ" onClose={onClose}>
      {/* 中身の高さに合わせて伸びるシートなので、余白は本文側に置く */}
      <View style={styles.content}>
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
    </BottomSheet>
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
    content: {
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.four,
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
