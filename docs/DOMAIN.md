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

## 8. 決めていないこと

- ナビゲーション（expo-router / React Navigation）
- 状態管理ライブラリを追加するかどうか
- 通知（Notification）の配信手段

いずれも必要になったTaskでLeaderが決定し、この文書へ追記する。
