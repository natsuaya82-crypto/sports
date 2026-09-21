import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Palette, Spacing } from '@/ui/theme';
import { useThemedStyles } from '@/ui/contexts/theme-context';

interface Props {
  message: string;
  /**
   * 「もどる」を出すか。
   * prototypeでは画面によって有無が違うため、既定では出さない。
   */
  showBack?: boolean;
}

/**
 * 対象が見つからなかったときの画面。
 * 募集・チーム・プロフィール・やりとりで同じ見た目を使う。
 */
export function NotFoundScreen({ message, showBack = false }: Props) {
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>{message}</Text>
        {showBack && (
          <Pressable onPress={() => router.back()}>
            <Text style={styles.notFoundBack}>もどる</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: c.background },
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
    },
    notFoundText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    notFoundBack: {
      fontSize: 13,
      fontWeight: '700',
      color: Brand.primary,
    },
  });
