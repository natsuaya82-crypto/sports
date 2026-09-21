import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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

import { Brand, LevelColors, Palette, Spacing } from '@/constants/theme';
import { useAppTheme, useThemedStyles } from '@/contexts/theme-context';
import { updateTeam, useTeam } from '@/data/team-store';
import {
  Level,
  LevelLabels,
  RecruitmentType,
  RecruitmentTypeLabels,
  Sport,
  SportLabels,
} from '@/types/recruitment';
import type { Team, TeamNews } from '@/types/team';

/** 編集画面のセクション */
export type EditSection =
  | 'basic'
  | 'color'
  | 'activity'
  | 'recruiting'
  | 'news'
  | 'achievements';

const SECTION_TITLES: Record<EditSection, string> = {
  basic: '基本情報',
  color: 'チームカラー',
  activity: '活動情報',
  recruiting: '募集している種別',
  news: 'お知らせ',
  achievements: '出場大会・戦績',
};

/** チームカラーの選択肢 */
const COLOR_PRESETS = [
  '#166534',
  '#0DA678',
  '#0284C7',
  '#1D4ED8',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#111827',
];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** 項目ごとの編集画面(編集メニューから遷移) */
export default function TeamEditSectionScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const { id, section } = useLocalSearchParams<{ id: string; section: EditSection }>();
  const team = useTeam(id);

  if (!team || !section || !(section in SECTION_TITLES)) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>ページが見つかりませんでした</Text>
        </View>
      </SafeAreaView>
    );
  }

  const save = (patch: Partial<Omit<Team, 'id'>>) => {
    updateTeam(team.id, patch);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.headerSide}>
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{SECTION_TITLES[section]}</Text>
        <View style={styles.headerSide} />
      </View>

      {section === 'basic' && <BasicForm team={team} onSave={save} />}
      {section === 'color' && <ColorForm team={team} onSave={save} />}
      {section === 'activity' && <ActivityForm team={team} onSave={save} />}
      {section === 'recruiting' && <RecruitingForm team={team} onSave={save} />}
      {section === 'news' && <NewsForm team={team} onSave={save} />}
      {section === 'achievements' && <AchievementsForm team={team} onSave={save} />}
    </SafeAreaView>
  );
}

interface FormProps {
  team: Team;
  onSave: (patch: Partial<Omit<Team, 'id'>>) => void;
}

/** 基本情報 */
function BasicForm({ team, onSave }: FormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [name, setName] = useState(team.name);
  const [tagline, setTagline] = useState(team.tagline);
  const [bio, setBio] = useState(team.bio);
  const [ward, setWard] = useState(team.ward);
  const [sport, setSport] = useState<Sport>(team.sport);
  const [level, setLevel] = useState<Level>(team.level);

  const canSave = name.trim() !== '' && ward.trim() !== '';

  return (
    <FormScaffold
      canSave={canSave}
      color={team.color}
      onSave={() =>
        onSave({
          name: name.trim(),
          tagline: tagline.trim(),
          bio: bio.trim(),
          ward: ward.trim(),
          sport,
          level,
        })
      }>
      <Field label="チーム名(必須)">
        <TextInput value={name} onChangeText={setName} style={styles.input} />
      </Field>
      <Field label="キャッチコピー" hint="サイトの顔になる一言">
        <TextInput
          value={tagline}
          onChangeText={setTagline}
          placeholder="例: 世田谷から、都リーグへ。"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </Field>
      <Field label="チーム紹介">
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          style={[styles.input, styles.inputMultiline]}
        />
      </Field>
      <Field label="活動エリア(必須)">
        <TextInput value={ward} onChangeText={setWard} style={styles.input} />
      </Field>
      <Field label="競技">
        <View style={styles.chipRow}>
          {(Object.keys(SportLabels) as Sport[]).map((s) => (
            <Chip
              key={s}
              label={SportLabels[s]}
              selected={sport === s}
              onPress={() => setSport(s)}
            />
          ))}
        </View>
      </Field>
      <Field label="レベル感">
        <View style={styles.chipRow}>
          {(Object.keys(LevelLabels) as Level[]).map((l) => (
            <Chip
              key={l}
              label={LevelLabels[l]}
              color={LevelColors[l]}
              selected={level === l}
              onPress={() => setLevel(l)}
            />
          ))}
        </View>
      </Field>
    </FormScaffold>
  );
}

/** チームカラー */
function ColorForm({ team, onSave }: FormProps) {
  const styles = useThemedStyles(makeStyles);
  const [color, setColor] = useState(team.color);

  return (
    <FormScaffold canSave color={color} onSave={() => onSave({ color })}>
      <Text style={styles.sectionHint}>
        サイトのヘッダー・見出し・ボタンがこの色で統一されます
      </Text>
      <View style={styles.colorRow}>
        {COLOR_PRESETS.map((c2) => (
          <Pressable
            key={c2}
            onPress={() => setColor(c2)}
            style={[
              styles.colorSwatch,
              { backgroundColor: c2 },
              color === c2 && styles.colorSwatchSelected,
            ]}>
            {color === c2 && <Ionicons name="checkmark" size={18} color="#ffffff" />}
          </Pressable>
        ))}
      </View>
      {/* 選択中カラーのプレビュー */}
      <View style={[styles.colorPreview, { backgroundColor: color }]}>
        <Text style={styles.colorPreviewName}>{team.name}</Text>
        <Text style={styles.colorPreviewText}>ヘッダーのイメージ</Text>
      </View>
    </FormScaffold>
  );
}

/** 活動情報 */
function ActivityForm({ team, onSave }: FormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [homeGround, setHomeGround] = useState(team.homeGround ?? '');
  const [schedule, setSchedule] = useState(team.schedule ?? '');
  const [memberCount, setMemberCount] = useState(
    team.memberCount != null ? String(team.memberCount) : '',
  );
  const [ageRange, setAgeRange] = useState(team.ageRange ?? '');
  const [founded, setFounded] = useState(team.founded != null ? String(team.founded) : '');
  const [instagram, setInstagram] = useState(team.instagram ?? '');

  const save = () => {
    const memberCountNum = Number.parseInt(memberCount, 10);
    const foundedNum = Number.parseInt(founded, 10);
    onSave({
      homeGround: homeGround.trim() || undefined,
      schedule: schedule.trim() || undefined,
      memberCount: Number.isFinite(memberCountNum) ? memberCountNum : undefined,
      ageRange: ageRange.trim() || undefined,
      founded: Number.isFinite(foundedNum) ? foundedNum : undefined,
      instagram: instagram.trim() || undefined,
    });
  };

  return (
    <FormScaffold canSave color={team.color} onSave={save}>
      <Text style={styles.sectionHint}>
        空欄の項目はサイトに表示されません(未定ならそのままでOK)
      </Text>
      <Field label="活動場所">
        <TextInput
          value={homeGround}
          onChangeText={setHomeGround}
          placeholder="例: 二子玉川緑地運動場(固定でなければ空欄)"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </Field>
      <Field label="活動日">
        <TextInput
          value={schedule}
          onChangeText={setSchedule}
          placeholder="例: 毎週水曜 19:00〜(不定期なら空欄)"
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
      </Field>
      <View style={styles.fieldRow}>
        <Field label="メンバー数" style={styles.fieldHalf}>
          <TextInput
            value={memberCount}
            onChangeText={setMemberCount}
            keyboardType="number-pad"
            placeholder="非公開なら空欄"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </Field>
        <Field label="年齢層" style={styles.fieldHalf}>
          <TextInput
            value={ageRange}
            onChangeText={setAgeRange}
            placeholder="例: 20〜30代"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </Field>
      </View>
      <View style={styles.fieldRow}>
        <Field label="創設年" style={styles.fieldHalf}>
          <TextInput
            value={founded}
            onChangeText={setFounded}
            keyboardType="number-pad"
            placeholder="例: 2019"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </Field>
        <Field label="Instagram" style={styles.fieldHalf}>
          <TextInput
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
            placeholder="@なしのID"
            placeholderTextColor={colors.textSecondary}
            style={styles.input}
          />
        </Field>
      </View>
    </FormScaffold>
  );
}

/** 募集種別 */
function RecruitingForm({ team, onSave }: FormProps) {
  const styles = useThemedStyles(makeStyles);
  const [recruiting, setRecruiting] = useState<RecruitmentType[]>(team.recruiting);

  const toggle = (t: RecruitmentType) => {
    setRecruiting((prev) =>
      prev.includes(t) ? prev.filter((v) => v !== t) : [...prev, t],
    );
  };

  return (
    <FormScaffold canSave color={team.color} onSave={() => onSave({ recruiting })}>
      <Text style={styles.sectionHint}>
        サイトの募集ページとチーム検索のカードに表示されます
      </Text>
      <View style={styles.chipRow}>
        {(Object.keys(RecruitmentTypeLabels) as RecruitmentType[]).map((t) => (
          <Chip
            key={t}
            label={RecruitmentTypeLabels[t]}
            selected={recruiting.includes(t)}
            onPress={() => toggle(t)}
          />
        ))}
      </View>
    </FormScaffold>
  );
}

/** お知らせ */
function NewsForm({ team, onSave }: FormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [news, setNews] = useState<TeamNews[]>(team.news ?? []);
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setNews((prev) => [{ date: todayString(), text }, ...prev]);
    setDraft('');
  };

  return (
    <FormScaffold
      canSave
      color={team.color}
      onSave={() => onSave({ news: news.length > 0 ? news : undefined })}>
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="例: リーグ戦 5-1で勝利!"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, styles.addInput]}
        />
        <Pressable
          onPress={add}
          style={[styles.addButton, !draft.trim() && styles.addButtonDisabled]}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>
      {news.length === 0 && <Text style={styles.sectionHint}>まだお知らせがありません</Text>}
      {news.map((n, i) => (
        <View key={`${n.date}-${n.text}`} style={styles.listRow}>
          <Text style={styles.listRowDate}>{n.date.slice(5).replace('-', '/')}</Text>
          <Text style={styles.listRowText} numberOfLines={2}>
            {n.text}
          </Text>
          <Pressable
            onPress={() => setNews((prev) => prev.filter((_, j) => j !== i))}
            hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={Brand.danger} />
          </Pressable>
        </View>
      ))}
    </FormScaffold>
  );
}

/** 実績 */
function AchievementsForm({ team, onSave }: FormProps) {
  const { colors } = useAppTheme();
  const styles = useThemedStyles(makeStyles);
  const [achievements, setAchievements] = useState<string[]>(team.achievements ?? []);
  const [draft, setDraft] = useState('');

  const add = () => {
    const text = draft.trim();
    if (!text) return;
    setAchievements((prev) => [...prev, text]);
    setDraft('');
  };

  return (
    <FormScaffold
      canSave
      color={team.color}
      onSave={() =>
        onSave({ achievements: achievements.length > 0 ? achievements : undefined })
      }>
      <View style={styles.addRow}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="例: 区民大会 ベスト4(2025)"
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, styles.addInput]}
        />
        <Pressable
          onPress={add}
          style={[styles.addButton, !draft.trim() && styles.addButtonDisabled]}>
          <Text style={styles.addButtonText}>追加</Text>
        </Pressable>
      </View>
      {achievements.length === 0 && (
        <Text style={styles.sectionHint}>
          戦績がなくてもサイトは成立します(戦績ページが非表示になるだけ)
        </Text>
      )}
      {achievements.map((a, i) => (
        <View key={`${a}-${i}`} style={styles.listRow}>
          <Text style={styles.listRowText} numberOfLines={2}>
            {a}
          </Text>
          <Pressable
            onPress={() => setAchievements((prev) => prev.filter((_, j) => j !== i))}
            hitSlop={8}>
            <Ionicons name="trash-outline" size={16} color={Brand.danger} />
          </Pressable>
        </View>
      ))}
    </FormScaffold>
  );
}

/** フォーム共通の骨格(スクロール+保存バー) */
function FormScaffold({
  children,
  canSave,
  color,
  onSave,
}: {
  children: React.ReactNode;
  canSave: boolean;
  color: string;
  onSave: () => void;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      <View style={styles.saveBar}>
        <Pressable
          onPress={onSave}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: color },
            !canSave && styles.saveButtonDisabled,
            pressed && styles.savePressed,
          ]}>
          <Text style={styles.saveText}>保存する</Text>
        </Pressable>
      </View>
    </>
  );
}

function Field({
  label,
  hint,
  style,
  children,
}: {
  label: string;
  hint?: string;
  style?: object;
  children: React.ReactNode;
}) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.field, style]}>
      <View style={styles.fieldLabelRow}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
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
    safeArea: {
      flex: 1,
      backgroundColor: c.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.two,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    headerSide: {
      width: 32,
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    content: {
      padding: Spacing.three,
      gap: Spacing.two,
      paddingBottom: 120,
    },
    sectionHint: {
      fontSize: 11,
      lineHeight: 17,
      color: c.textSecondary,
    },
    field: {
      gap: 5,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: Spacing.two,
    },
    fieldHalf: {
      flex: 1,
    },
    fieldLabelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: Spacing.two,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: c.text,
    },
    fieldHint: {
      fontSize: 10,
      color: c.textSecondary,
    },
    input: {
      backgroundColor: c.backgroundElement,
      borderRadius: 10,
      paddingHorizontal: Spacing.two,
      paddingVertical: 10,
      fontSize: 13,
      color: c.text,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    chip: {
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 7,
      backgroundColor: c.backgroundElement,
    },
    chipText: {
      fontSize: 12,
      fontWeight: '600',
      color: c.text,
    },
    chipTextSelected: {
      color: Brand.onPrimary,
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.two,
    },
    colorSwatch: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    colorSwatchSelected: {
      borderWidth: 3,
      borderColor: c.backgroundSelected,
    },
    colorPreview: {
      borderRadius: 12,
      padding: Spacing.three,
      gap: 2,
      marginTop: Spacing.two,
    },
    colorPreviewName: {
      fontSize: 15,
      fontWeight: '800',
      color: '#ffffff',
    },
    colorPreviewText: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.85)',
    },
    addRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      alignItems: 'center',
    },
    addInput: {
      flex: 1,
    },
    addButton: {
      backgroundColor: Brand.primary,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      paddingVertical: 10,
    },
    addButtonDisabled: {
      opacity: 0.4,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.onPrimary,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: c.border,
      borderRadius: 10,
      padding: Spacing.two,
    },
    listRowDate: {
      fontSize: 11,
      fontWeight: '700',
      color: c.textSecondary,
    },
    listRowText: {
      flex: 1,
      fontSize: 12,
      color: c.text,
    },
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
    },
    saveButtonDisabled: {
      opacity: 0.4,
    },
    savePressed: {
      opacity: 0.85,
    },
    saveText: {
      fontSize: 14,
      fontWeight: '800',
      color: '#ffffff',
    },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
  });
