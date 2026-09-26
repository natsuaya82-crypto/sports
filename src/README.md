# src

レイヤ境界。依存の向きは一方向とする。

```text
ui  ──▶  data  ──▶  domain
                     ▲
lib ─────────────────┘（lib は誰にも依存しない）
```

| ディレクトリ | 責務 | 依存してよい相手 |
| --- | --- | --- |
| `domain/` | ビジネスルールと型。UIにもデータ取得手段にも依存しない | なし |
| `data/` | Supabase等の外部データアクセス。取得結果をdomainの型へ変換する | `domain`, `lib` |
| `ui/` | 画面とcomponent | `domain`, `data`, `lib` |
| `lib/` | 汎用ユーティリティ。ドメイン知識を持たない | なし |

この向きは `scripts/check-architecture.sh` が検証する。Gateの `architecture` 項目。

境界を変更する必要が生じた場合、Workerは実装せずLeaderへ報告する（CLAUDE.md 第17章）。
