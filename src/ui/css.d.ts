/**
 * CSS の import を型として通す宣言（src/ui/theme.ts が global.css を読む）。
 *
 * Expo は同じ宣言を expo-env.d.ts に生成するが、そのファイルは .gitignore の対象で
 * CI のまっさらなチェックアウトには存在しない。手元でだけ型チェックが通り、
 * GitHub の Gate で落ちるのを防ぐため、コミットされる場所に置く。
 */
declare module '*.css';
