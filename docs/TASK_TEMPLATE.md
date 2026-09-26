# Task Template

LeaderがWorkerへTaskを発行するときの形式。

docs/LEADER.md が要求する項目を、実際に渡す文面として定義する。
Leaderはこの全項目を埋めてからWorkerを起動する。埋められない項目がある場合、
Task分割がまだ完了していない。

---

## Task: <名前>

### Branch

`feature/<name>` | `fix/<name>` | `refactor/<name>`

### 目的

このTaskで何を達成するか。1つのTaskに1つの目的。

### 背景

ユーザー要求のどの部分に対応するか。関連する既存機能。

### 事前確認（Worker必須）

実装前に確認するファイル・モジュール。Leaderが調査済みの内容を渡す。

- 関連する既存component / hook / service / model:
- 関連するAPI:
- 関連するDB schema / migration:
- 関連する既存テスト:

### 変更してよい領域

### 変更してはいけない領域

<!-- 他Workerの担当範囲、共有基盤など。 -->

### 再利用する既存実装

<!-- 再利用先が確定しているものを明示する。
     ここが空の場合、Workerは新規作成前にLeaderへ確認する。 -->

### やらないこと

<!-- Task範囲外。ついでの修正の禁止対象。 -->

### 完了条件

- [ ]
- [ ] `scripts/gate.sh` が通る
- [ ] 既存機能を壊していない

### 必要な検証

### 他Workerとの競合

<!-- 同時進行中のTaskと、共有ファイルがある場合の扱い。 -->
