# SPORTS — AI Development Rules

## 0. このファイルの目的

このリポジトリでは、AIによる継続的な開発でコードベースが「増築」され、重複実装・責務混在・依存関係の崩壊・既存機能の破壊が起きることを防ぐ。

このプロジェクトでは、**開発プロセスそのものをアーキテクチャの一部として扱う。**

最優先事項は「今動くこと」だけではない。

- 後から機能を追加できる
- 既存機能を壊しにくい
- 同じ概念を複数の実装で表現しない
- 変更箇所と責務が追跡できる
- AIが別セッションで作業しても設計が一貫する

ことを維持する。

---

## 1. 開発体制

### Leader

Opus / Fable 等の強力なAIセッションを **Leader** として扱う。

Leaderは単なる指示伝達役ではない。

Leaderの責務:

1. ユーザーから要求を受ける
2. リポジトリの現状を確認する
3. 既存アーキテクチャへの影響を判断する
4. 作業を適切なWorkerへ分割する
5. Workerの作業を監督する
6. 約15分ごとにWorkerを監査する
7. Workerの質問・判断事項を回収する
8. 必要な場合のみユーザーへ確認する
9. Workerの成果物をレビューする
10. 問題がなければmainへ統合する
11. 全作業完了後にGateを実行する
12. Gate通過後にBuild/TestFlightへ進める

LeaderはWorkerに丸投げして終了してはいけない。

### Worker

WorkerはLeaderから割り当てられた範囲だけを実装する。

Workerの原則:

- 自分のbranchだけを変更する
- 担当Taskの範囲を越えない
- 既存設計を勝手に変更しない
- ユーザーへ直接質問しない
- 判断できない事項はLeaderへ報告する
- 「ついでの修正」を行わない
- 完了条件を満たしてから完了報告する

---

## 2. 標準開発フロー

```text
User
  ↓
Leader
  ↓
Repository / Architecture inspection
  ↓
Task decomposition
  ↓
Worker branches
  ↓
Worker implementation
  ↓
~15 min Leader audit
  ↓
Worker completion
  ↓
Leader review
  ↓
Merge to main
  ↓
Gate
  ↓
Build
  ↓
TestFlight
  ↓
Real-device verification
```

### 絶対ルール

Workerがmainへ直接変更を加えてはいけない。

mainに統合するのはLeaderだけとする。

---

## 3. 作業開始前の必須確認

AIは、既存コードを確認せずに実装を開始してはいけない。

必ず以下を確認する。

1. 現在のディレクトリ構造
2. 関連する既存ファイル
3. 関連するコンポーネント / service / hook / model
4. 関連するDB schema / migration
5. 関連するAPI
6. 既存のテスト
7. 既存機能への影響

既存の仕組みで対応できる場合は再利用する。

新しい仕組みを作る場合は、既存の仕組みでは対応できない理由を明確にする。

---

## 4. アーキテクチャ原則

### Single Source of Truth

同じ概念・状態・ルールを複数箇所で独立して管理しない。

例えば、同じビジネスルールをUI、別service、別APIでそれぞれ実装してはいけない。

### Single Responsibility

1つのモジュール・service・hook・componentに責務を詰め込みすぎない。

### Reuse Before Create

新しいcomponent / hook / service / utility / modelを作る前に、既存のものを検索する。

### No Duplicate Concepts

同じ概念に対して別名・別model・別APIを増やさない。

### No Hidden Coupling

一見関係のないmodule同士を暗黙の副作用で接続しない。

### No Circular Dependency

循環依存を作らない。

### Explicit Boundaries

UI、domain/business logic、data access、外部サービス等の責務境界を明確にする。

### Minimal Change

Task達成に必要な最小範囲を変更する。

### No Opportunistic Refactor

今回のTaskと無関係なリファクタリングは禁止。

問題を発見した場合は別TaskとしてLeaderへ報告する。

---

## 5. 新機能追加ルール

新しい機能を追加するときは、単純に既存ファイルへコードを足してはいけない。

最初に以下を考える。

- 既存のどの概念に属するか
- 既存modelで表現できるか
- 既存serviceで処理できるか
- 既存componentを再利用できるか
- 新しい抽象化が本当に必要か
- 将来同種の機能が追加された場合にも成立する設計か

### 特に禁止する実装

- featureごとに同じ処理をコピーする
- featureごとに似たmodelを作る
- featureごとに似たAPIを乱立させる
- 一時的なif文を大量に追加する
- 型エラーを `any` 等で隠す
- 将来使う予定という理由だけで過剰な抽象化を作る

---

## 6. ドメイン設計

このサービスはスポーツの種類や利用形態が増えることを前提に設計する。

基本概念の例:

- User
- Team
- Sport
- Opportunity（募集）
- Application / Participation
- Location
- Notification

ただし、実装時にこれらを機械的に作るのではなく、実際の要件と既存構造を確認して決定する。

### Team

Teamはユーザーアカウントとは別のエンティティ。

ユーザーがTeamを作成・管理する。

Team専用アカウントを作る設計にはしない。

### Opportunity

募集・参加機会は、可能な限り共通のドメインモデルで扱う。

例:

- 個人参加募集
- チームメンバー募集
- 練習参加募集
- セレクション
- 練習試合 / 対戦相手募集
- 大会
- イベント

種類が増えるたびに完全に独立したバックエンドシステムを作らない。

共通化できる部分は共通化し、スポーツ固有の差分は明示的に拡張する。

---

## 7. UI / UXについて

UI/UXの具体的なデザインは現段階では固定しない。

現在のPCプロトタイプと、ユーザーからの明示的な指示をVisual Source of Truthとする。

AIは、プロトタイプや明示的な仕様を確認できない状態で独自にUI/UXの方向性を決めてはいけない。

以下はAIが勝手に固定してはいけない:

- 色
- 角丸
- レイアウト
- ナビゲーション
- アニメーション
- アイコン
- 文言
- カード構造
- 画面構成

UIの変更自体は禁止しない。ユーザーの指示に従って柔軟に変更する。

ただし、UI変更のためにdomain/data architectureを勝手に変更してはいけない。

---

## 8. データベース / Migration

DB schemaを変更する場合:

- migrationを使用する
- 本番DBを直接変更しない
- 既存データへの影響を確認する
- nullable / default / foreign key等の影響を確認する
- rollbackや互換性を考慮する

DB変更をUI実装のついでに隠れて行ってはいけない。

---

## 9. 依存関係

新しいpackage / libraryを追加する前に既存依存を確認する。

禁止:

- 同じ目的のlibraryを複数導入する
- 軽微な処理のために新規dependencyを追加する
- 古いdependencyを無視して別libraryを追加する
- dependency変更をTaskに記載せず行う

新規dependencyが必要な場合、Leaderがその必要性を把握できる状態にする。

---

## 10. Git / Branch

### main

`main` は常に統合可能な状態を維持する。

Workerはmainを直接変更しない。

### Worker branch

Task単位でbranchを作る。

例:

```text
feature/<task-name>
fix/<task-name>
refactor/<task-name>
```

1 branch = 1つの明確な目的。

### PR

PRには最低限以下を含める:

- 何を変更したか
- なぜ変更したか
- 変更範囲
- テスト内容
- 未解決事項

無関係な変更をPRへ混ぜない。

---

## 11. Leaderの15分監査

Leaderは約15分ごとにWorkerの状態を確認する。

確認項目:

- Taskの範囲内か
- 設計から逸脱していないか
- 重複実装がないか
- 不要なファイルを増やしていないか
- 既存機能を壊していないか
- dependencyを勝手に増やしていないか
- schemaを勝手に変更していないか
- unrelated refactorをしていないか
- エラーで止まっていないか
- 質問・判断待ちがないか

問題があれば完成を待たず、その時点でWorkerへ修正指示を出す。

---

## 12. Workerの質問

Workerが判断に必要な情報を持っていない場合、ユーザーへ直接質問しない。

```text
Worker
  ↓
Leader
  ↓
User
  ↓
Leader
  ↓
Worker
```

Leaderは、複数Workerから出た質問を整理し、ユーザーへの質問回数を必要最小限にする。

---

## 13. 完了判定

Worker自身の「完了しました」は完了判定ではない。

Leaderが以下を確認する。

- 要件を満たしている
- Task範囲外の変更がない
- 既存設計と矛盾しない
- 型チェック / lint / test等が通る
- 不要なtemporary codeがない
- TODOで問題を隠していない

問題があればWorkerへ戻す。

---

## 14. Gate

全Workerの作業をmainへ統合した後、Gateを実行する。

Gateは「見た感じ大丈夫」ではなく、可能な限り機械的に検証する。

最低限の候補:

- typecheck
- lint
- unit/integration tests
- build
- migration/schema consistency
- dependency consistency
- architecture constraints
- unexpected file changes

Gateが通らない場合、TestFlightへ進めない。

---

## 15. TestFlight

Gate通過後にBuildし、TestFlightへ進める。

TestFlightでは実機で確認する。

実機確認で問題が見つかった場合、問題をTaskとして切り出し、同じLeader → Worker → Review → Gateの流れに戻す。

---

## 16. 仕様変更

AIはユーザーの明示的な仕様を独自判断で変更してはいけない。

「このほうが一般的」「このほうが実装しやすい」という理由だけで仕様を変えない。

改善案がある場合は、実装前にLeaderからユーザーへ提示する。

---

## 17. 禁止事項まとめ

以下は禁止。

- Workerによるmain直接変更
- ユーザーへのWorker直接質問
- 既存コードを読まずに実装開始
- 無関係なリファクタリング
- 同じ機能の重複実装
- 同じ概念の重複model
- 勝手なAPI乱立
- 勝手なdependency追加
- `any`等による型問題の隠蔽
- migrationなしのschema変更
- temporary hackを完成扱いすること
- ユーザーの仕様を勝手に変更すること
- UIプロトタイプを無視した独自デザイン判断

---

## 18. 最終原則

**新しい機能を追加するたびに、コードベースを汚さないことを機能完成と同じくらい重要視する。**

短期的に最速の実装ではなく、将来の変更コストを増やさない実装を選ぶ。

迷った場合は「今動くか」だけではなく、

> **「この構造のまま、同じ種類の機能を10個追加しても破綻しないか？」**

を基準に判断する。
