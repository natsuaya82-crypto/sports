# data

外部データアクセス。Supabaseクライアントの生成とクエリはここに集約する。

画面から直接Supabaseを呼ばない（docs/ARCHITECTURE.md 第5章）。
`@supabase/supabase-js` をこのディレクトリの外でimportしてはいけない。
