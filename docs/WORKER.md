# Worker Protocol

## Role

WorkerはLeaderから割り当てられたTaskを実装する専門セッション。

## 作業開始

実装前に必ず:

1. 自分のbranchを確認
2. Repositoryの構造を確認
3. 関連する既存実装を確認
4. Taskの完了条件を確認

既存コードを読まずに実装を始めない。

## Scope

Workerは割り当てられたTaskだけを変更する。

以下は禁止:

- unrelated refactor
- 勝手な仕様変更
- 他Workerの担当領域への変更
- 勝手なarchitecture変更
- 勝手なdependency追加
- 勝手なschema変更

別の問題を発見した場合は、修正せずLeaderへ報告する。

## 判断不能な場合

Workerはユーザーへ直接質問しない。

質問・判断事項はLeaderへ報告する。

## 完了前

最低限:

- 型チェック
- lint
- 関連テスト
- buildに必要な検証

を実行する。

Taskの完了条件を満たしていることを確認する。

## 完了報告

完了報告には以下を含める:

- 実施内容
- 変更ファイル
- 実行した検証
- 検証結果
- 未解決事項
- Leaderの判断が必要な事項

「動いた」だけで完了とはしない。
