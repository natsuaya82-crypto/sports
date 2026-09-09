#!/usr/bin/env bash
#
# Migration check — supabase/migrations/ の整合性を検証する。
#
# 1. 命名規約・重複・空ファイル・破壊的変更の申告（DB不要）
# 2. 全migrationを空のデータベースへ順に適用できること
#
# 適用先の決定順:
#   1. 環境変数 DATABASE_URL があればそれを使う（CIはこちら）
#   2. 無ければ initdb / pg_ctl で使い捨てクラスタを起動する
#   3. どちらも使えない場合は失敗する
#
# migrationが1件も無い場合、静的チェックのみ成功して終了する。

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 2

MIGRATIONS_DIR="supabase/migrations"
VIOLATIONS=0

report() {
  VIOLATIONS=$((VIOLATIONS + 1))
  printf '  [ NG ] %s\n' "$1"
  [ -n "${2:-}" ] && printf '%s\n' "$2" | sed 's/^/         | /'
}

printf '\n--- migrations ---\n'

if [ ! -d "$MIGRATIONS_DIR" ]; then
  printf '  %s が無い。\n\n' "$MIGRATIONS_DIR"
  exit 1
fi

# ファイル名順 = 適用順。Supabaseの規約に合わせ <14桁timestamp>_<name>.sql とする。
mapfile -t MIGRATIONS < <(find "$MIGRATIONS_DIR" -maxdepth 1 -name '*.sql' -type f | sort)

# --- 1. 静的チェック ---

for f in "${MIGRATIONS[@]}"; do
  base="$(basename "$f")"

  if ! printf '%s' "$base" | grep -q -E '^[0-9]{14}_[a-z0-9_]+\.sql$'; then
    report "命名規約違反: $base" '<14桁timestamp>_<snake_case>.sql'
  fi

  if [ ! -s "$f" ]; then
    report "空のmigration: $base"
  fi

  # 破壊的変更は申告を必須にする（CLAUDE.md 第8章）。
  if grep -q -i -E '\b(drop[[:space:]]+(table|column|schema|type)|truncate)\b' "$f"; then
    if ! grep -q -E '^--[[:space:]]*destructive:' "$f"; then
      report "破壊的変更に申告が無い: $base" \
        '先頭へ "-- destructive: <理由と既存データへの影響>" を書く'
    fi
  fi
done

# timestampの重複は適用順を不定にする。
dups="$(printf '%s\n' "${MIGRATIONS[@]}" | xargs -r -n1 basename | cut -c1-14 | sort | uniq -d)"
[ -n "$dups" ] && report 'timestampが重複している' "$dups"

if [ "$VIOLATIONS" -gt 0 ]; then
  printf '\nmigrations: %d violation(s)\n\n' "$VIOLATIONS"
  exit 1
fi

if [ "${#MIGRATIONS[@]}" -eq 0 ]; then
  printf '  [ OK ] 静的チェック（migrationは0件）\n\n'
  exit 0
fi

printf '  [ OK ] 静的チェック（%d件）\n' "${#MIGRATIONS[@]}"

# --- 2. 適用チェック ---

PG_TMP=""
cleanup() {
  if [ -n "$PG_TMP" ]; then
    as_pg "pg_ctl -D '$PG_TMP/data' -m immediate -w stop" >/dev/null 2>&1
    rm -rf "$PG_TMP"
  fi
}
trap cleanup EXIT

# rootのままではPostgreSQLが起動しないため、その場合だけpostgresユーザーへ降りる。
as_pg() {
  if [ "$(id -u)" -eq 0 ] && id postgres >/dev/null 2>&1; then
    su postgres -c "PATH='$PGBIN:\$PATH' $1"
  else
    PATH="$PGBIN:$PATH" bash -c "$1"
  fi
}

PSQL_TARGET=()

if [ -n "${DATABASE_URL:-}" ]; then
  if ! command -v psql >/dev/null 2>&1; then
    report 'psql が見つからない' 'DATABASE_URL を使うにはPostgreSQLクライアントが必要'
    printf '\nmigrations: 適用チェックを実行できなかった\n\n'
    exit 1
  fi
  PSQL_TARGET=("$DATABASE_URL")
  printf '  適用先: DATABASE_URL\n'
else
  PGBIN=""
  for d in /usr/lib/postgresql/*/bin /usr/local/pgsql/bin /opt/homebrew/bin /usr/bin; do
    [ -x "$d/initdb" ] && [ -x "$d/pg_ctl" ] && PGBIN="$d" && break
  done
  if [ -z "$PGBIN" ]; then
    report 'PostgreSQLへ接続できない' \
      'DATABASE_URL を設定するか、PostgreSQL（initdb / pg_ctl）を用意する'
    printf '\nmigrations: 適用チェックを実行できなかった\n\n'
    exit 1
  fi

  PG_TMP="$(mktemp -d)"
  mkdir -p "$PG_TMP/data" "$PG_TMP/sock"
  chmod 777 "$PG_TMP" "$PG_TMP/sock"
  if [ "$(id -u)" -eq 0 ] && id postgres >/dev/null 2>&1; then
    chown -R postgres:postgres "$PG_TMP"
  fi

  if ! as_pg "initdb -D '$PG_TMP/data' -A trust -U postgres" >"$PG_TMP/initdb.log" 2>&1; then
    report 'initdbに失敗' "$(tail -n 10 "$PG_TMP/initdb.log")"
    printf '\nmigrations: 適用チェックを実行できなかった\n\n'
    exit 1
  fi

  # TCPは開かず、一時ディレクトリのunix socketだけで待ち受ける。
  if ! as_pg "pg_ctl -D '$PG_TMP/data' -o \"-k '$PG_TMP/sock' -h ''\" -l '$PG_TMP/server.log' -w start" \
      >"$PG_TMP/start.log" 2>&1; then
    report 'PostgreSQLの起動に失敗' "$(tail -n 10 "$PG_TMP/server.log" 2>/dev/null)"
    printf '\nmigrations: 適用チェックを実行できなかった\n\n'
    exit 1
  fi

  PSQL_TARGET=(-h "$PG_TMP/sock" -U postgres -d postgres)
  printf '  適用先: 使い捨てクラスタ（%s）\n' "$PGBIN"
fi

run_psql() {
  if [ "$(id -u)" -eq 0 ] && [ -n "$PG_TMP" ] && id postgres >/dev/null 2>&1; then
    su postgres -c "PATH='$PGBIN:\$PATH' psql $(printf '%q ' "${PSQL_TARGET[@]}") -v ON_ERROR_STOP=1 -q $*"
  else
    psql "${PSQL_TARGET[@]}" -v ON_ERROR_STOP=1 -q "$@"
  fi
}

APPLY_LOG="$(mktemp)"
applied=0
for f in "${MIGRATIONS[@]}"; do
  if run_psql -f "$f" >"$APPLY_LOG" 2>&1; then
    applied=$((applied + 1))
  else
    report "適用に失敗: $(basename "$f")" "$(tail -n 20 "$APPLY_LOG")"
    break
  fi
done
rm -f "$APPLY_LOG"

if [ "$VIOLATIONS" -gt 0 ]; then
  printf '\nmigrations: %d violation(s)\n\n' "$VIOLATIONS"
  exit 1
fi

printf '  [ OK ] 空のデータベースへ %d件すべて適用できた\n\n' "$applied"
exit 0
