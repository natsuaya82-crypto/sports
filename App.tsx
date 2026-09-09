import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// アプリのエントリ。画面はまだ存在しない。
// UI/UXはユーザーのprototypeと明示的な指示をSource of Truthとする（CLAUDE.md 第7章）。
// 画面を追加するTaskで src/ui/ 配下へ実装し、ここから接続する。
export default function App() {
  return (
    <View style={styles.container}>
      <Text>sports</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
