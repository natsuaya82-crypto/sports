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

import { BottomBar } from '@/ui/components/BottomBar';
import { Screen } from '@/ui/components/Screen';
import { ScreenHeader } from '@/ui/components/list/ScreenHeader';
import { SelectableChip } from '@/ui/components/SelectableChip';
import { Brand, LevelColors, Palette, Spacing } from '@/ui/theme';
import { useCurrentUser, useAuth } from '@/ui/contexts/auth-context';
import { useAppTheme, useThemedStyles } from '@/ui/contexts/theme-context';
import { LEVELS, Level, getLevelLabel } from '@/domain/level';
import { SPORTS, Sport, getSportLabel } from '@/domain/sport';

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
    <Screen>
      <ScreenHeader title="プロフィールを編集" />

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
            {SPORTS.map((s) => (
              <SelectableChip
                key={s}
                style={styles.chip}
                selectedTextStyle={styles.chipTextSelected}
                label={getSportLabel(s)}
                selected={sports.includes(s)}
                onPress={() => toggleSport(s)}
              />
            ))}
          </View>
        </Field>

        <Field label="レベル感">
          <View style={styles.chipRow}>
            {LEVELS.map((l) => (
              <SelectableChip
                key={l}
                style={styles.chip}
                selectedTextStyle={styles.chipTextSelected}
                label={getLevelLabel(l)}
                color={LevelColors[l]}
                selected={level === l}
                onPress={() => setLevel(l)}
              />
            ))}
          </View>
        </Field>
      </ScrollView>

      <BottomBar>
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
      </BottomBar>
    </Screen>
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

const makeStyles = (c: Palette) =>
  StyleSheet.create({
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
    chip: { paddingVertical: 8 },
    chipTextSelected: { fontWeight: '700' },
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
