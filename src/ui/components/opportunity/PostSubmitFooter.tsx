import { Pressable, StyleSheet, Text } from 'react-native';

import { Brand, Palette } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  /** 常設メンバー募集はチームの公式サイトへ掲載するので導線が変わる */
  isMemberRecruit: boolean;
  canSubmit: boolean;
  canSubmitMemberRecruit: boolean;
  onSubmit: () => void;
  onSubmitMemberRecruit: () => void;
}

/** 募集作成フォームの送信ボタン */
export function PostSubmitFooter({
  isMemberRecruit,
  canSubmit,
  canSubmitMemberRecruit,
  onSubmit,
  onSubmitMemberRecruit,
}: Props) {
  const styles = useThemedStyles(makeStyles);

  if (isMemberRecruit) {
    return (
      <Pressable
        onPress={onSubmitMemberRecruit}
        disabled={!canSubmitMemberRecruit}
        style={({ pressed }) => [
          styles.submitButton,
          !canSubmitMemberRecruit && styles.submitDisabled,
          pressed && styles.submitPressed,
        ]}>
        <Text style={styles.submitText}>公式サイトに掲載する</Text>
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        onPress={onSubmit}
        disabled={!canSubmit}
        style={({ pressed }) => [
          styles.submitButton,
          !canSubmit && styles.submitDisabled,
          pressed && canSubmit && styles.submitPressed,
        ]}>
        <Text style={styles.submitText}>この内容で募集する</Text>
      </Pressable>
      {!canSubmit && (
        <Text style={styles.submitHint}>
          競技・募集タイプ・タイトル・会場を入れると募集できます
        </Text>
      )}
    </>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    submitButton: {
      alignItems: 'center',
      paddingVertical: 14,
      borderRadius: 999,
      backgroundColor: Brand.primary,
    },
    submitPressed: {
      backgroundColor: Brand.primaryPressed,
    },
    submitDisabled: {
      opacity: 0.4,
    },
    submitText: {
      fontSize: 14,
      fontWeight: '800',
      color: Brand.onPrimary,
    },
    submitHint: {
      fontSize: 11,
      color: c.textSecondary,
      textAlign: 'center',
    },
  });
