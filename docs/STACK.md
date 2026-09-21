# 技術構成

Leaderがユーザーへ確認して決定した構成（CLAUDE.md 第16章）。

Workerがこの構成を単独で変更してはいけない。

## 決定

| 領域 | 採用 | 理由 |
| --- | --- | --- |
| クライアント | React Native + Expo (TypeScript) | iOS / Android を単一コードベースで出す。TestFlightとGoogle Playの両方へ配布できる |
| バックエンド / DB | Supabase (PostgreSQL) | 認証・DB・ストレージが揃い、SQL migrationをリポジトリで管理できる |
| 言語 | TypeScript (strict) | 型を落とさない。`any`による回避はGateで検出する |
| ナビゲーション | expo-router | UI prototypeが既にファイルベースルーティングで組まれている。CLAUDE.md 第7章によりprototypeをVisual Source of Truthとするため、これを採用する |

Expo SDK 57 / React 19 / React Native 0.86 / TypeScript 6。

## ルーティングの置き場所

expo-routerのroutesは `src/ui/app/` に置く。

`app.json` の expo-router plugin へ `root: "./src/ui/app"` を渡して既定の `app/` から移している。
routesは画面そのものでありUIレイヤに属する。リポジトリ直下に `app/` を置くと
`src/README.md` が定めるレイヤ境界の外にUIが出てしまい、`scripts/check-architecture.sh` の
「ui の外で react-native を参照している」に該当する。境界を崩さないためにrootを指定する。

## Gateとの対応

| Gate項目 | コマンド |
| --- | --- |
| typecheck | `tsc --noEmit` |
| lint | `eslint .` (eslint-config-expo) |
| test | `jest` (jest-expo) |
| build | `expo export`（iOS / Android バンドル生成） |
| dependency | `npm ci --dry-run`（package.json と lockfile の同期） |
| architecture | `scripts/check-architecture.sh`（レイヤ境界）+ eslint `import/no-cycle`（循環依存） |
| migration | `scripts/check-migrations.sh`（命名規約・破壊的変更の申告・空DBへの適用） |
| duplication | `jscpd`（重複率1%超で失敗） |
| unused | `knip`（未使用ファイル・未使用export） |

実際のコマンドは `gate.conf` が唯一の定義箇所。

## 品質ツールの選定

| 目的 | 採用 | 補足 |
| --- | --- | --- |
| 重複検出 | jscpd | 閾値は `.jscpd.json`。50トークン・5行以上の重複を1%まで許容 |
| 未使用コード | knip | 設定は `knip.json` |
| 循環依存 | eslint `import/no-cycle` | madgeはTypeScript 6に未対応のため採用しない。eslint-config-expoが持つ eslint-plugin-import で代替でき、依存を増やさない |
| 責務の肥大化 | eslint | `max-lines` / `max-lines-per-function` / `complexity`。domain・data・lib は厳しく、ui はJSXの分だけ緩める |

`knip.json` の `ignoreDependencies` に `expo-updates` を入れている。
knipのExpoプラグインが `app.json` の `version` から誤検出するもので、実際には使っていない。

## 決定済みだが未導入

| 用途 | 採用 | 導入時期 |
| --- | --- | --- |
| validation | zod | 最初にschemaが必要になるTask。理由は docs/DOMAIN.md 第6章 |

不要なdependencyを先に入れないため、決定の記録だけを先に置く。

## 未確定

以下はまだ決めていない。決めるまで実装しない。

- **状態管理**: 追加ライブラリを入れるかどうか。必要になるまで入れない。
- **配布**: EAS Build の設定と TestFlight / Google Play への接続。

## 追加済みの依存（prototype移植時）

prototypeのソースが実際にimportしているものだけを入れている。
Expoテンプレート由来で未参照だったもの（`@expo/ui` / `expo-glass-effect` / `expo-device` /
`expo-font` / `expo-system-ui` / `react-native-gesture-handler` / `playwright` 等）は持ち込まない。

| package | 用途 |
| --- | --- |
| expo-router | ファイルベースルーティング |
| expo-linking / expo-constants / react-native-screens / react-native-safe-area-context | expo-routerの前提 |
| expo-splash-screen | 起動画面（app.json plugin） |
| @expo/vector-icons | アイコン |
| expo-image | 画像表示 |
| expo-linear-gradient | グラデーション |
| expo-symbols | SF Symbols |
| expo-web-browser | 外部リンクの表示 |
| react-native-svg | ベクタ描画 |
| react-native-reanimated / react-native-worklets | アニメーション |
| @react-native-async-storage/async-storage | ログイン状態の永続化（モック段階） |

## 依存の追加

新しいpackageの追加はLeaderが判断する（CLAUDE.md 第9章）。

Workerは必要性をLeaderへ報告し、指示を受けてから追加する。
