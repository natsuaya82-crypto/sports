import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import { Colors, Palette } from '@/ui/theme';

/** ユーザーが選ぶテーマ設定 */
export type ThemeMode = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'themeMode';

interface ThemeContextValue {
  /** 設定値(system含む) */
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  /** 実際に適用されるスキーム */
  scheme: 'light' | 'dark';
  colors: Palette;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // 保存済みの設定を復元
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = (next: ThemeMode) => {
    setModeState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  };

  const scheme: 'light' | 'dark' =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo(
    () => ({ mode, setMode, scheme, colors: Colors[scheme] as Palette }),
    [mode, scheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within AppThemeProvider');
  return ctx;
}

/**
 * テーマ対応スタイルのヘルパー。
 * モジュールスコープで定義した factory を渡すと、パレット変更時だけ再生成される。
 */
export function useThemedStyles<T>(factory: (c: Palette) => T): T {
  const { colors } = useAppTheme();
  return useMemo(() => factory(colors), [factory, colors]);
}
