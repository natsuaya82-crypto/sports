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
| `docs/TASK_TEMPLATE.md` | LeaderがWorkerへTaskを渡す形式 |

## Gate

```sh
./scripts/gate.sh            # 未設定の検証はSKIP
./scripts/gate.sh --strict   # 未設定の検証もFAIL
```

Gateはpush・PRごとに GitHub Actions（`.github/workflows/gate.yml`）でも実行される。

検証コマンドは `gate.conf` で宣言する。Gateスクリプトは技術構成を推測しない。

## 技術構成

未確定。

アプリケーションコードはまだ存在しない。技術構成が決まるまで `gate.conf` の
構成依存チェック（typecheck / lint / test / build / migration / dependency /
architecture）はすべて未設定であり、GateはSKIPとして報告する。

技術構成の決定はLeaderがユーザーへ確認してから行う。AIが単独で決めない
（CLAUDE.md 第9章・第16章）。

## Branch

```text
main          統合済みの安定版。直接変更しない
feature/*     機能追加
fix/*         修正
refactor/*    リファクタリング
```

mainへの統合はPR経由。統合の判断はLeaderが行う。
