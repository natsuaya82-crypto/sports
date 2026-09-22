# ドメイン設計

Leaderが決定した、ドメインモデルとその拡張方式。

この文書の目的は「同じ種類の機能を10個追加しても破綻しない構造」を先に決めることである。
募集の種類が増えるたびに新しいテーブル・新しいAPI・新しい画面一式を作ることを防ぐ。

Workerがこの方式を単独で変更してはいけない。変更が必要だと判断した場合はLeaderへ報告する。

---

## 1. 中心概念

```text
User ──owns──▶ Team ──has──▶ TeamMember
 │                              ▲
 │ hosts                        │
 ▼                              │
Opportunity ◀──applies to── Application ──by── User または Team
 │
 ├── Sport
 └── Location
```

すべてのアカウントはUserである。Teamはログインしない。
Teamの権限はTeamMemberのroleで判定する。

## 2. Opportunityの拡張方式

募集・参加機会はすべて `opportunity` 1テーブルを骨格とする。

種類は `kind` 列で区別する。

```text
individual_join   個人参加募集
team_member       チームメンバー募集
practice          練習参加募集
selection         セレクション
friendly_match    練習試合・対戦相手募集
tournament        大会
event             イベント
```

### 共通列

すべての種類が持つ。

```text
id, kind, sport_id, title, description,
host_user_id, host_team_id (nullable),
location_id, starts_at, ends_at, application_deadline,
capacity, status, created_at, updated_at
```

主催は常にUserである（`host_user_id` は必須）。
Teamとして主催する場合のみ `host_team_id` が入る。これによりTeam専用アカウントが不要になる。

### 差分の持ち方

検討した3案。

| 案 | 内容 | 判定 |
| --- | --- | --- |
| A | 単一テーブル + JSONB `details` | 不採用 |
| B | 共通テーブル + 種類別detailテーブル | **採用** |
| C | 種類ごとに独立したテーブル一式 | 禁止 |

**採用理由**

Aは型もconstraintも外部キーも効かない。`any` で型エラーを隠すことのDB版になる。
検索条件になる属性（レベル、年齢層、参加費）がJSONBに入ると、インデックスと絞り込みが破綻する。

Cは CLAUDE.md 第6章が明示的に禁止している。

Bは共通部分を1箇所に保ったまま、種類固有の属性へ制約と外部キーを付けられる。

**重要な運用ルール**

detailテーブルは、その種類に固有の構造化された属性が実際に必要になってから作る。
最初から7種類分のdetailテーブルを作らない（「新しい抽象化は必要になってから」）。

共通列だけで表現できる種類は、detailテーブルを持たない。

### スポーツ固有の属性

スポーツごとの任意属性（例: バドミントンのシングルス/ダブルス）は
`sport_attributes` JSONB に置いてよい。

ただし条件がある。**検索・絞り込み・集計の対象になった時点で列へ昇格させる。**
昇格はmigrationとして書く。JSONBを検索条件に使わない。

これがJSONBを許す唯一の範囲である。

## 3. Application

応募も1テーブルで扱う。

```text
id, opportunity_id,
applicant_user_id (必須), applicant_team_id (nullable),
status, message, created_at, updated_at
```

個人が応募する場合は `applicant_team_id` が null。
Teamとして応募する場合（対戦相手募集など）に入る。

これにより「個人参加」と「チーム対チーム」が同じテーブルで成立する。

### 不変条件

同一Opportunityに対して同一応募者が重複して有効な応募を持てない。

部分ユニークインデックスで表現する。アプリケーション側のif文で防がない。

```sql
create unique index application_no_duplicate
  on application (opportunity_id, applicant_user_id)
  where status in ('pending', 'accepted');
```

## 4. Participation

**最初は作らない。**

`application.status = 'accepted'` を参加とみなす。

出欠記録・結果記録・評価など、応募とは別のライフサイクルを持つ情報が必要になった
時点で切り出す。その時点でTaskとして起票する。

## 5. 認可はRLSに置く

**認可判定のSingle Source of TruthはSupabaseのRLSポリシーとする。**

- RLSポリシーはmigrationに書く。`scripts/check-migrations.sh` の検証対象になる
- クライアント側の条件分岐は「表示の出し分け」だけ。認可判定をクライアントに置かない
- 同じ権限ルールをRLSとアプリの両方に書かない

**理由**

React Nativeアプリはanon keyを配布物に含む。RLSが無ければ、アプリのUIで隠しても
データは誰でも読める。クライアントの判定は信用できない。

すべてのテーブルで `enable row level security` を有効にする。
ポリシーを書かないテーブルを公開しない。

## 6. Validation

**zodに一本化する。** 他のvalidationライブラリを追加しない。

- schemaは `src/domain` に置く
- UIとdataの両方が同じschemaを使う
- TypeScriptの型はschemaから導出する（`z.infer`）

**理由**

同じ検証ルールをUIとサーバー境界で別々に書くと必ずずれる。
schemaから型を導出すれば、型と検証が構造的にずれない。

ただしDBの制約はRLSと同様にmigration側にも書く。
zodは入力の検証、DB制約はデータの保証であり、責務が違う。

## 7. 命名

### ファイル

```text
component        PascalCase.tsx     OpportunityCard.tsx
それ以外         kebab-case.ts      opportunity-search.ts
ディレクトリ     kebab-case
```

### 関数の動詞

| 接頭辞 | 意味 | 置き場所 |
| --- | --- | --- |
| `get` | 計算・変換のみ。I/Oしない | domain, lib |
| `fetch` | ネットワーク越しの取得 | data |
| `create` / `update` / `delete` | 変更 | data |
| `is` / `has` / `can` | boolean を返す | domain |
| `use` | React hook | ui |

`get` がネットワークアクセスをしない、という区別を守る。
これを守らないと、どの関数がI/Oするか読めなくなる。

### 型

単数形のPascalCase。配列であることを名前に含めない。

```text
Opportunity        OpportunityList ではない
```

### 使ってはいけない名前

`manager` / `helper` / `util` / `handler` / `info` / `service` を
単独の名前として使わない。責務が不明になり、なんでも入る置き場になる。

何をするかを名前にする（`OpportunityValidator` ではなく `validateOpportunity`）。

## 8. prototype移植時の決定

UI prototypeを `src/` のレイヤ構造へ移すにあたりLeaderが決定した事項。

### Recruitment を Opportunity へ統合

prototypeの `Recruitment` と、第2章の `Opportunity` は同じ概念だった。
同じ概念に別modelを置かないため（CLAUDE.md 第17章）`Opportunity` へ一本化し、
`RecruitmentType` を `kind` へ対応させた。

| prototype | kind | 表示名 |
| --- | --- | --- |
| `helper` | `individual_join` | 助っ人募集 |
| `member` | `team_member` | メンバー募集 |
| `trial` | `practice` | 体験参加OK |
| `match` | `friendly_match` | 対戦相手募集 |

`selection` / `tournament` / `event` は第2章で決めた種類として型には持つが、
prototypeに画面が無いためUIの選択肢には出さない。
detailテーブルは第2章のとおり、固有の構造化属性が必要になるまで作らない。

### Person と UserAccount を User へ統合

prototypeには「自分のアカウント」と「スカウト対象の個人」で別の型があったが、
どちらも同じ概念の公開プロフィールである。`User` へ統合し、個人LPの項目
（ポジション・プレースタイル・経歴・活動可能曜日・希望する参加形態）を
任意フィールドとして持たせた。

### TeamMember という名前を分けた

第1章の `TeamMember` は権限判定に使う所属レコード。
prototypeが持っていたのは公開ページに載せる名簿で、ログインアカウントと
結びついていない。別物なので後者を `TeamRosterEntry` とした。

権限判定はモック段階では `User.managedTeamIds` で行う。
Supabase導入時に第5章のとおりRLSへ移し、そこで所属レコードとしての
`TeamMember` を作る。**認可をクライアントに残さない。**

### モック段階で許している非正規化

バックエンドが無いため集計・結合の代わりに値を持たせている箇所がある。
Supabase導入時に置き換える。
（`filledCount` は第9章 9.3 で `reservedCount` と受理済み応募の件数に分けて解消した）

| フィールド | 本来 | 置き換え先 |
| --- | --- | --- |
| `Opportunity.hostTeamName` | `host_team_id` からの結合 | join |
| `Opportunity.distanceKm` | 会場と閲覧者の位置から算出 | 位置情報の導入時 |

## 9. 実績と発見（ランキング）

### 9.1 方針: 実績は集計値ではなく履歴で残す

「参加回数: 12」のような**カウンタを保存しない**。
「いつ・誰が・どの募集で・どうだったか」を時刻付きの記録として残し、
スコアや件数は読み出すときに計算する。

**理由**

カウンタで持つと累計しか分からない。後から「直近6ヶ月で」「古い実績は
軽く」と言われた瞬間に再現できなくなる。履歴で持てば集計の仕方は
いつでも変えられる。

### 9.2 Participation（参加記録）

第4章で「出欠記録が必要になった時点で切り出す」としていたもの。
出席率を出すために必要になったので作る。

```text
id, applicationId, opportunityId, userId, hostTeamId (nullable),
status: attended | no_show, recordedAt
```

- 受理（accepted）された応募に対してだけ記録できる
- 開催日を過ぎてから記録できる（日程未定の常設募集には記録しない）
- 1つの応募に1件まで。付け直しは上書きではなく記録し直しとする

### 9.3 残り枠の数え方

`filledCount` というカウンタは「アプリ外で既に決まっている人数」と
「アプリで受理された人数」が混ざっており、受理済みの応募と二重管理になっていた。
次の2つに分ける。

| 値 | 意味 | 持ち方 |
| --- | --- | --- |
| `reservedCount` | 主催者がアプリ外で既に確保している人数 | 保存する（主催者の入力値） |
| `acceptedCount` | アプリで受理された応募の件数 | **保存しない**。読み出し時に Application から数える |

残り枠 = `capacity - reservedCount - acceptedCount`。
Supabase導入時は `acceptedCount` を集計ビューにする。

### 9.4 累積だけで並べない

累積の実績で並べると、先に始めた人ほど上に来て新規は報われない。
新規が報われなければ母数が増えず、企画書フェーズ1の「継続利用率」とぶつかる。
次の5つを組み合わせる。

| # | 手段 | 何に使うか |
| --- | --- | --- |
| ① | **時間減衰** | 古い実績ほど軽くする。半減期 90日 |
| ② | **率 + 縮約** | 回数ではなく出席率。少ない件数では全体平均へ引き戻す |
| ③ | **新規枠** | 一覧の一定位置を登録30日以内の相手に割り当てる |
| ④ | **マッチ度** | 総合順位ではなく、見ている人との相性で並べる |
| ⑤ | **到達型バッジ** | 相対順位ではなく、条件を満たしたら付く印 |

**並び順の基本はマッチ度（④）とする。** このアプリの目的は「誰が一番強いか」
ではなく「組みたい相手が見つかるか」だからである。
実績（①②）は同じマッチ度の中での補助と、バッジ（⑤）に使う。

### 9.5 計算の定義

計算は `src/domain/reputation.ts`（実績）/ `badge.ts`（バッジ）/
`discovery.ts`（マッチ度と並び順）に置く。`now` は引数で受け取り、
関数の中で現在時刻を読まない（テストと再現性のため）。

**時間減衰（①）**

```text
weight = 0.5 ^ (経過日数 / 90)
```

**出席率の縮約（②）**

```text
出席率 = (Σ weight × 出席 + 縮約の重み × 全体平均) / (Σ weight + 縮約の重み)
縮約の重み = 3、全体平均 = 0.85
```

記録が1件も無い人は全体平均と同じになり、「1回参加して1回出席＝100%」で
上位に出ることが無い。

**マッチ度（④）** — 0〜1

| 要素 | 重み | 内容 |
| --- | --- | --- |
| 競技 | 0.4 | 見ている人の競技に含まれるか |
| レベル | 0.3 | 段階の差が0なら満点、1段ずれるごとに半分 |
| エリア | 0.2 | 同じ市区町村なら満点、同じ都道府県なら半分 |
| 参加形態 | 0.1 | 希望する参加形態と募集している種類が重なるか |

**並び順** — マッチ度の高い順。**マッチ度が同じときだけ**実績の高い順。

足し算で混ぜない。当初は `マッチ度 × 0.8 + 実績 × 0.2` としていたが、
実績の大きい遠方のチームが、条件ぴったりの新しいチームに勝ってしまった
（エリア不一致の減点 0.16 < 実績の最大加点 0.2）。累積の強さで新規が
埋もれることを防ぐのがこの章の目的なので、実績は同点の順位付けにだけ効かせる。
マッチ度は重みの組み合わせで決まる飛び飛びの値なので、同点は十分に起こる。

その上で③の新規枠を適用する。新規が4件のあいだ1件も出てこなければ、
残っている新規の最上位を繰り上げる。**下限の保証であって上限ではない**ため、
元から上位にいる新規を後ろへ下げることはない。

**バッジ（⑤）**

| 対象 | 条件 | 表示 |
| --- | --- | --- |
| User / Team | 登録から30日以内 | はじめたばかり |
| User | 減衰込みの記録が3件以上で出席率90%以上 | 出席率◎ |
| User | 累計出席10回以上 | 参加10回+ |
| Team | 直近30日に開催実績がある | 活動中 |
| Team | 累計開催10回以上 | 開催10回+ |

累計の件数をバッジに使うのは構わない。到達したら付くだけで、
他人との順位を作らないからである。

### 9.6 調整する前提の値

半減期・縮約の重み・各重み・新規枠の間隔・バッジの閾値は**初期値**である。
実際の利用データを見て調整する。値は `src/domain/discovery-config.ts` に
定数として1箇所にまとめ、画面側へ散らさない。

## 10. 決めていないこと

- 状態管理ライブラリを追加するかどうか
- 通知（Notification）の配信手段

いずれも必要になったTaskでLeaderが決定し、この文書へ追記する。
