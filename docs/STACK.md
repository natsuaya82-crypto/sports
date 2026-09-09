# 技術構成

Leaderがユーザーへ確認して決定した構成（CLAUDE.md 第16章）。

Workerがこの構成を単独で変更してはいけない。

## 決定

| 領域 | 採用 | 理由 |
| --- | --- | --- |
| クライアント | React Native + Expo (TypeScript) | iOS / Android を単一コードベースで出す。TestFlightとGoogle Playの両方へ配布できる |
| バックエンド / DB | Supabase (PostgreSQL) | 認証・DB・ストレージが揃い、SQL migrationをリポジトリで管理できる |
| 言語 | TypeScript (strict) | 型を落とさない。`any`による回避はGateで検出する |

Expo SDK 57 / React 19 / React Native 0.86 / TypeScript 6。

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

- **ナビゲーション**: expo-router / React Navigation のどちらか。
  画面が複数になるTaskで、UI prototypeを確認してから決定する。
- **状態管理**: 追加ライブラリを入れるかどうか。必要になるまで入れない。
- **配布**: EAS Build の設定と TestFlight / Google Play への接続。

## 依存の追加

新しいpackageの追加はLeaderが判断する（CLAUDE.md 第9章）。

Workerは必要性をLeaderへ報告し、指示を受けてから追加する。
