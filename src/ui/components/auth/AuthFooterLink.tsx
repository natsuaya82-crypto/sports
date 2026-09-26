import { Pressable, Text, View } from 'react-native';

import { useThemedStyles } from '@/ui/contexts/theme-context';

import { makeAuthStyles } from './auth-form';

interface Props {
  text: string;
  link: string;
  onPress: () => void;
}

/** 認証画面の一番下の誘導(説明 + リンク) */
export function AuthFooterLink({ text, link, onPress }: Props) {
  const styles = useThemedStyles(makeAuthStyles);

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{text}</Text>
      <Pressable onPress={onPress}>
        <Text style={styles.footerLink}>{link}</Text>
      </Pressable>
    </View>
  );
}
