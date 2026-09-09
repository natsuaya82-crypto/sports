# supabase

Supabaseのschemaを管理する。

`migrations/` にSQL migrationを時系列で置く。production databaseを直接変更しない
（CLAUDE.md 第8章）。

schema変更時は既存データ・既存API・既存UI・既存migrationへの影響を確認する。

## 命名規約

```text
supabase/migrations/<14桁timestamp>_<snake_case>.sql
例: 20260115093000_create_opportunity.sql
```

ファイル名順が適用順。timestampを重複させない。

## 破壊的変更

`drop table` / `drop column` / `drop schema` / `drop type` / `truncate` を含む
migrationは、先頭に理由と既存データへの影響を書く。

```sql
-- destructive: <理由と既存データへの影響>
```

申告が無い破壊的変更はGateが弾く。

## 検証

```sh
./scripts/check-migrations.sh
```

命名規約・重複・空ファイル・破壊的変更の申告を確認したうえで、空のデータベースへ
全migrationを順に適用する。`DATABASE_URL` があればそれを使い、無ければ使い捨ての
PostgreSQLクラスタを起動する。

Gateの `migration` 項目としても実行される。

## 採番はLeaderが行う

複数Workerが並行してmigrationを作ると、timestampが近接して適用順が意図とずれる。

Leaderがtimestampを含むファイル名をTask発行時に指定する。Workerは自分で採番しない。

原則として 1 Task = 最大 1 migration とする。

重複はGateが検出するが、事故を検出する仕組みであって採番方法ではない。

## RLS

すべてのテーブルで row level security を有効にし、ポリシーをmigrationに書く。

認可判定はRLSがSingle Source of Truth。クライアント側に置かない。
理由と方針は docs/DOMAIN.md 第5章を参照。

ポリシーを持たないテーブルを公開しない。
