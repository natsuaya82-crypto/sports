/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

import type { Level, RecruitmentType } from '@/types/recruitment';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    border: '#E0E1E6',
    /** 枠外(PC表示時の余白)の背景 */
    outerBackground: '#F0F0F3',
    tagBackground: '#EDEDF0',
    tagText: '#494A50',
    /** ブランド色の淡い背景(選択中ハイライト等) */
    primarySoft: '#E6F7F1',
    /** 締切オーバーレイなどの被せ色 */
    veil: 'rgba(255,255,255,0.55)',
  },
  dark: {
    text: '#ffffff',
    background: '#151618',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    border: '#2E3135',
    outerBackground: '#000000',
    tagBackground: '#2A2B2E',
    tagText: '#B0B4BA',
    primarySoft: '#123B2F',
    veil: 'rgba(0,0,0,0.55)',
  },
} as const;

/** テーマごとの色一式 */
export type Palette = typeof Colors.light;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** アプリ全体のブランドカラー(ピッチグリーン基調)。テーマに依存しない色だけを置く */
export const Brand = {
  primary: '#0DA678',
  primaryPressed: '#0B8F67',
  onPrimary: '#FFFFFF',
  danger: '#E5484D',
  info: '#3B82F6',
  levelEnjoy: '#30A46C',
  levelMiddle: '#F76B15',
  levelSerious: '#E5484D',
} as const;

/** スマホ想定の1画面の最大幅(Web表示時に中央寄せする) */
export const MaxPhoneWidth = 480;

/** 募集タイプごとのラベル色(カードのバッジと絞りこみチップで共用) */
export const RecruitmentTypeColors: Record<RecruitmentType, string> = {
  helper: '#E5484D',
  member: '#3B82F6',
  match: '#30A46C',
  trial: '#F76B15',
};

/** レベルごとのラベル色(カードのバッジと絞りこみチップで共用) */
export const LevelColors: Record<Level, string> = {
  enjoy: Brand.levelEnjoy,
  middle: Brand.levelMiddle,
  serious: Brand.levelSerious,
};
