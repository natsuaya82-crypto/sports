# Gate

Gateは、実装が完了した後にmainを次の段階へ進めてよいか判定する品質ゲート。

## 原則

Gateを通過しない状態でTestFlightへ進めない。

## 実行

```sh
./scripts/gate.sh            # 未設定の検証はSKIPとして報告する
./scripts/gate.sh --strict   # 未設定の検証をFAILとして扱う
```

GateはPRとmainへのpushごとに GitHub Actions（`.github/workflows/gate.yml`）でも実行される。

各検証を実際に実行するコマンドは `gate.conf` で宣言する。
検証コマンドの定義箇所は `gate.conf` 一箇所とし、スクリプトやCIへ直接書かない。

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

組み込みは `gate.conf` への追記として行う。

技術構成が確定するまで、構成依存の検証は未設定のままSKIPされる。
TestFlightへ進む前の最終Gateは `--strict` で実行し、未設定の検証が残っていないことを確認する。

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
