# Gate

Gateは、実装が完了した後にmainを次の段階へ進めてよいか判定する品質ゲート。

## 原則

Gateを通過しない状態でTestFlightへ進めない。

## 必須確認

プロジェクトの技術構成に応じて、利用可能な検証を実行する。

- typecheck
- lint
- unit tests
- integration tests
- build
- migration / schema consistency
- dependency consistency
- architecture constraints
- unexpected changes

存在しない検証を無理に作る必要はないが、利用可能になった検証はGateへ組み込む。

## Fail時

1. 原因を特定
2. 必要なら修正Taskを作成
3. Workerで修正
4. Leader review
5. 再度Gate

Gateを無視して先へ進まない。

## TestFlight

GateがGreenになった後にBuildし、TestFlightへ進める。

TestFlightで発見した問題も、通常のLeader → Worker → Review → Gateの流れで修正する。
