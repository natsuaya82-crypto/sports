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
| architecture | `scripts/check-architecture.sh`（レイヤ境界） |
| migration | 未設定 |

実際のコマンドは `gate.conf` が唯一の定義箇所。

## 未確定

以下はまだ決めていない。決めるまで実装しない。

- **migration検証**: Supabase CLI の導入方法と、CI で schema 整合性をどう確認するか。
  最初の migration を追加するTaskで決定し、`gate.conf` の `GATE_MIGRATION` を埋める。
- **ナビゲーション**: expo-router / React Navigation のどちらか。
  画面が複数になるTaskで、UI prototypeを確認してから決定する。
- **状態管理**: 追加ライブラリを入れるかどうか。必要になるまで入れない。
- **配布**: EAS Build の設定と TestFlight / Google Play への接続。

## 依存の追加

新しいpackageの追加はLeaderが判断する（CLAUDE.md 第9章）。

Workerは必要性をLeaderへ報告し、指示を受けてから追加する。
