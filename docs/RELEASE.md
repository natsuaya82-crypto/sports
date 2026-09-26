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
| ビルド | 署名のしかたを決める（下の表）→ ビルド番号を run 番号にする → `expo prebuild` → Archive → Export → アップロード |
| TestFlight | 内部テストグループを API で作り（すべてのビルドを自動で配る設定）、テスターを入れる |

LLLLLLL / JJJJ との違いは、**プロビジョニングプロファイルを手で作らない**こと。
向こうでは Apple Developer の画面で作って `PROVISIONING_PROFILE_BASE64` に入れていたが、
1年で切れて「Invalid Signature」で落ちる（LLLLLLL docs/apple.md §7）。
ここでは毎回 API で確かめ、無いか切れかけ（14日前）なら作り直す。

## 1回だけやること（人）

### 1. Secrets を入れる

GitHub → natsuaya82-crypto/sports → Settings → Secrets and variables → Actions → **Secrets**

**必須は4つ。** うち3つは App Store Connect の同じ画面で手に入る。

| 名前 | 中身 | どこで手に入るか |
| --- | --- | --- |
| `APP_STORE_CONNECT_ISSUER_ID` | Issuer ID | App Store Connect → ユーザとアクセス → 統合 → App Store Connect API → チームキー。表の上に出ている |
| `IOS_KEY_ID` | キー ID | 同じ画面のキーの一覧 |
| `IOS_API_KEY` | キー（.p8）の中身 | 同じ画面でキーを作るときに一度だけダウンロードできる。テキストで開き、`-----BEGIN` から `END-----` までを丸ごと貼る |
| `APPLE_TEAM_ID` | Team ID（英数字10桁） | developer.apple.com → Account → メンバーシップの詳細 |

LLLLLLL / JJJJ に入れてあるキーと同じものでよい。ただし Secrets は GitHub でも読み出せないので、
**.p8 ファイルが手元に残っていなければ、新しくキーを作る**（古いキーはそのまま使い続けられる）。

- チームキーの「＋」→ 名前は何でもよい → **アクセスは Admin** → 生成 → ダウンロード
- Admin が要るのは、下の「クラウド署名」で Apple に配布証明書を用意してもらうため

**任意の2つ**（配布証明書 .p12 を使う場合だけ）

| 名前 | 中身 |
| --- | --- |
| `DISTRIBUTION_P12_BASE64` | 配布証明書（.p12）の base64 |
| `DISTRIBUTION_P12_PASSWORD` | その .p12 のパスワード |

| 入れたもの | 署名のしかた |
| --- | --- |
| 4つだけ | **クラウド署名**。xcodebuild が API のキーで Apple に署名を頼む。証明書もプロファイルも Apple 側で管理される |
| 4つ + p12 の2つ | 手動署名（LLLLLLL / JJJJ と同じ）。プロファイルは API で自動で用意する |

`PROVISIONING_PROFILE_BASE64` はどちらの方式でも**要らない**。

同じ画面の **Variables** に、TestFlight で受け取る人のメールを入れる（任意）。

| 名前 | 中身 |
| --- | --- |
| `TESTFLIGHT_TESTER_EMAIL` | App Store Connect にユーザーとして登録されているメール |

公開リポジトリなので、メールはコードやファイルに書かない。
**キーの中身をチャットやファイルに貼らないこと。** GitHub の Secrets の画面にだけ入れる。

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
| プロファイルの段 / Archive で 403 や「No signing certificate」 | API キーの権限が足りない。**Admin** のキーを作り直して `IOS_KEY_ID` と `IOS_API_KEY` を入れ替える |
| 「2つそろえるか、2つとも入れないか」 | p12 の Secrets が片方だけ入っている |
| 緑なのに TestFlight に出ない | Apple からのメール（却下の理由が届く） |
