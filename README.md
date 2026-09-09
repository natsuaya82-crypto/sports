# sports

スポーツの募集・参加をつなぐサービス。

## このリポジトリの読み方

開発ルールが実装より先に定義されている。実装を始める前に読む。

| ファイル | 内容 |
| --- | --- |
| `CLAUDE.md` | 開発ルールの本体。すべての判断の基準 |
| `docs/ARCHITECTURE.md` | 設計原則 |
| `docs/LEADER.md` | Leaderの責務と手順 |
| `docs/WORKER.md` | Workerの責務と制約 |
| `docs/GATE.md` | 品質ゲートの定義 |
| `docs/STACK.md` | 技術構成の決定と未確定事項 |
| `docs/TASK_TEMPLATE.md` | LeaderがWorkerへTaskを渡す形式 |

## Gate

```sh
./scripts/gate.sh            # 未設定の検証はSKIP
./scripts/gate.sh --strict   # 未設定の検証もFAIL
```

Gateはpush・PRごとに GitHub Actions（`.github/workflows/gate.yml`）でも実行される。

検証コマンドは `gate.conf` で宣言する。Gateスクリプトは技術構成を推測しない。

レイヤ境界（`src/README.md`）は `scripts/check-architecture.sh` が検証する。

## 技術構成

React Native + Expo (TypeScript) / Supabase。

詳細と未確定事項は `docs/STACK.md` を参照。

```sh
npm install
npm start           # Expo 開発サーバー
npm run typecheck
npm run lint
npm run test
```

## Branch

```text
main          統合済みの安定版。直接変更しない
feature/*     機能追加
fix/*         修正
refactor/*    リファクタリング
```

mainへの統合はPR経由。統合の判断はLeaderが行う。
