# supabase

Supabaseのschemaを管理する。

`migrations/` にSQL migrationを時系列で置く。production databaseを直接変更しない
（CLAUDE.md 第8章）。

schema変更時は既存データ・既存API・既存UI・既存migrationへの影響を確認する。
