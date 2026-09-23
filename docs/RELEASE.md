# リリース（TestFlight）

iOS のビルドは GitHub Actions の macOS で行う。Mac は要らない。
仕組みは `.github/workflows/ios-deploy.yml`。natsuaya82-crypto/LLLLLLL と JJJJ の
ios-deploy.yml を元にしていて、**Secrets の名前も同じ**なので値はそちらと同じものを入れればよい。

## 機械がやること

```text
Gate → App Store Connect の前提 → ビルド（macOS）→ TestFlight の配布設定
```

前の段が落ちたら先へ進まない。**Gate を通らないものは TestFlight に出さない**（docs/GATE.md）。

| 段 | やること |
| --- | --- |
| Gate | typecheck / lint / test / build / 重複 / 未使用 / レイヤ境界 など（gate.yml をそのまま呼ぶ） |
| App Store Connect の前提 | Bundle ID `com.tokinets.sports` を API で登録。アプリがあるか確かめ、無ければ止まる |
| ビルド | 配布証明書を入れる → **プロファイルを API で用意** → ビルド番号を run 番号にする → `expo prebuild` → Archive → Export → アップロード |
| TestFlight | 内部テストグループを API で作り（すべてのビルドを自動で配る設定）、テスターを入れる |

LLLLLLL / JJJJ との違いは、**プロビジョニングプロファイルを手で作らない**こと。
向こうでは Apple Developer の画面で作って `PROVISIONING_PROFILE_BASE64` に入れていたが、
1年で切れて「Invalid Signature」で落ちる（LLLLLLL docs/apple.md §7）。
ここでは毎回 API で確かめ、無いか切れかけ（14日前）なら作り直す。

## 1回だけやること（人）

### 1. Secrets を入れる

GitHub → natsuaya82-crypto/sports → Settings → Secrets and variables → Actions → **Secrets**

LLLLLLL / JJJJ に入れてあるものと**同じ値**を入れる。

| 名前 | 中身 |
| --- | --- |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect API の Issuer ID |
| `IOS_KEY_ID` | API キーの Key ID |
| `IOS_API_KEY` | API キー（.p8）の中身 |
| `APPLE_TEAM_ID` | Apple Developer の Team ID |
| `DISTRIBUTION_P12_BASE64` | 配布証明書（.p12）の base64 |
| `DISTRIBUTION_P12_PASSWORD` | その .p12 のパスワード |

`PROVISIONING_PROFILE_BASE64` は**要らない**（API で作るため）。

同じ画面の **Variables** に、TestFlight で受け取る人のメールを入れる（任意）。

| 名前 | 中身 |
| --- | --- |
| `TESTFLIGHT_TESTER_EMAIL` | App Store Connect にユーザーとして登録されているメール |

公開リポジトリなので、メールはコードやファイルに書かない。

### 2. 一度実行する（Bundle ID が登録される）

下の「実行のしかた」で1回動かす。「App Store Connect の前提」の段で
「アプリがありません」と出て止まるが、それで正しい。この時点で Bundle ID が登録される。

### 3. App Store Connect でアプリを作る

アプリそのものは API では作れない（Apple が提供していない）。

App Store Connect → マイ App → ＋ → 新規 App

| 項目 | 入れるもの |
| --- | --- |
| プラットフォーム | iOS |
| 名前 | App Store に出る名前。**App Store 全体で重複できない**ので `sports` は使えない |
| 主言語 | 日本語 |
| バンドル ID | `com.tokinets.sports`（2 で登録済みなので一覧に出る） |
| SKU | `sports` など、自分で分かれば何でもよい |

ホーム画面に出る名前は `app.json` の `name` で、ここの名前とは別。

### 4. もう一度実行する

以後は毎回これだけ。

## 実行のしかた

どちらか。

- **タグを push する**: `git tag build-1 && git push origin build-1`（番号は何でもよい）
- **Actions の画面から**: Actions → iOS Deploy to TestFlight → Run workflow
  （この方法は ios-deploy.yml が main に入ってから使える）

## 届いたビルドを入れる

1. アップロード完了から **10〜30分**で App Store Connect の処理が終わる
2. 内部テストグループは「すべてのビルドを自動で配る」設定なので、処理が終わると自動で届く
3. iPhone に **TestFlight アプリ**（App Store から）を入れ、届いた招待から入れる

輸出コンプライアンスの質問は出ない。`app.json` の `ITSAppUsesNonExemptEncryption = false`
（HTTPS しか使っていないので、これが正しい答え）。

## 番号

| 値 | 置き場所 |
| --- | --- |
| ビルド番号 | GitHub Actions の run 番号。毎回増えるので手で触らない |
| 版（1.0.0 など） | `app.json` の `expo.version` 一箇所 |

App Store で公開したあとは、公開済みの版にはビルドを受け付けない（ITMS-90186。LLLLLLL で実際に踏んだ）。
公開のたびに `expo.version` を上げる。

## 詰まったとき

| 症状 | 見るところ |
| --- | --- |
| 「次の Secrets がありません」 | 名前が表のとおりか（大文字小文字も） |
| 「アプリがありません」 | 手順 3 をまだやっていない |
| 「配布証明書が App Store Connect に見つかりません」 | `DISTRIBUTION_P12_BASE64` が同じチームの、失効していない証明書か |
| プロファイルの段で 403 | API キーの権限が足りない。App Store Connect → ユーザとアクセス → 統合 → キー で、**Admin** の権限を持つキーを使う |
| 緑なのに TestFlight に出ない | Apple からのメール（却下の理由が届く） |
