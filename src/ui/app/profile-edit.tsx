import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser, useAuth } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { Level, getLevelLabel } from '@/domain/level';
import { Sport, getSportLabel } from '@/domain/sport';

/** 個人プロフィールの編集 */
export default function ProfileEditScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const user = useCurrentUser();
  const { updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [ward, setWard] = useState(user.ward);
  const [bio, setBio] = useState(user.bio);
  const [sports, setSports] = useState<Sport[]>(user.sports);
  const [level, setLevel] = useState<Level>(user.level);

  const toggleSport = (s: Sport) =>
    setSports((prev) => (prev.includes(s) ? prev.filter((v) => v !== s) : [...prev, s]));

  const canSave = displayName.trim() !== '';

  const save = () => {
    if (!canSave) return;
    updateProfile({
      displayName: displayName.trim(),
      ward: ward.trim(),
      bio: bio.trim(),
      sports,
      level,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>プロフィールを編集</Text>
        <View style={styles.headerSide} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Field label="ニックネーム(必須)">
          <TextInput value={displayName} onChangeText={setDisplayName} style={styles.input} />
        </Field>
        <Field label="活動エリア">
          <TextInput
            value={ward}
            onChangeText={setWard}
            placeholder="例: 世田谷区"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </Field>
        <Field label="自己紹介">
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="プレースタイルや希望を書いておくとスカウトされやすくなります"
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, styles.inputMultiline]}
          />
        </Field>

        <Field label="やっている種目">
          <View style={styles.chipRow}>
            {(Object.keys(getSportLabel) as Sport[]).map((s) => (
              <Chip
                key={s}
                label={getSportLabel(s)}
                selected={sports.includes(s)}
                onPress={() => toggleSport(s)}
              />
            ))}
          </View>
        </Field>

        <Field label="レベル感">
          <View style={styles.chipRow}>
            {(Object.keys(getLevelLabel) as Level[]).map((l) => (
              <Chip
                key={l}
                label={getLevelLabel(l)}
                color={LevelColors[l]}
                selected={level === l}
                onPress={() => setLevel(l)}
              />
            ))}
          </View>
        </Field>
      </ScrollView>

      <View style={styles.saveBar}>
        <Pressable
          onPress={save}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            !canSave && styles.saveDisabled,
            pressed && styles.savePressed,
          ]}>
          <Text style={styles.saveText}>保存する</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color ?? Brand.primary }]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
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
    headerSide: { width: 32, alignItems: 'flex-start' },
    headerTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: 120 },
    field: { gap: 5 },
    fieldLabel: { fontSize: 12, fontWeight: '700', color: c.text },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 11,
      fontSize: 13,
      color: c.text,
    },
    inputMultiline: { minHeight: 90, textAlignVertical: 'top' },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: c.backgroundElement,
    },
    chipText: { fontSize: 12, fontWeight: '600', color: c.text },
    chipTextSelected: { color: Brand.onPrimary, fontWeight: '700' },
    saveBar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      padding: Spacing.three,
      backgroundColor: c.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.border,
    },
    saveButton: {
      alignItems: 'center',
      borderRadius: 999,
      paddingVertical: 14,
      backgroundColor: Brand.primary,
    },
    saveDisabled: { opacity: 0.4 },
    savePressed: { opacity: 0.85 },
    saveText: { fontSize: 14, fontWeight: '800', color: Brand.onPrimary },
  });
