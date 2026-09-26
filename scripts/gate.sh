#!/usr/bin/env bash
#
# Gate — docs/GATE.md の機械的検証。
#
#   scripts/gate.sh            未設定の検証は SKIP として報告する
#   scripts/gate.sh --strict   未設定の検証を FAIL として扱う
#
# 技術構成に依存する検証（typecheck / lint / test / build など）のコマンドは
# gate.conf で宣言する。このスクリプトは構成を推測しない。

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 2

STRICT=0
case "${1:-}" in
  --strict) STRICT=1 ;;
  "") ;;
  *) printf 'unknown option: %s\n' "$1" >&2; exit 2 ;;
esac

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
FAILED_CHECKS=()
SKIPPED_CHECKS=()

pass() {
  printf '  [ PASS ] %s\n' "$1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  printf '  [ FAIL ] %s\n' "$1"
  [ -n "${2:-}" ] && printf '%s\n' "$2" | sed 's/^/          | /'
  FAILED_CHECKS+=("$1")
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

skip() {
  if [ "$STRICT" -eq 1 ]; then
    fail "$1 (未設定: gate.conf)"
    return
  fi
  printf '  [ SKIP ] %s (未設定: gate.conf)\n' "$1"
  SKIPPED_CHECKS+=("$1")
  SKIP_COUNT=$((SKIP_COUNT + 1))
}

# 検査対象から除くもの。
# - ドキュメント: ルール文書は禁止語そのものを説明のために含む
# - Gate自身: 検出パターンを定義しているファイル
# - lockfile等の生成物: 人が書いたコードではなく、ハッシュ文字列が誤検出を生む
EXCLUDES=(
  ':(exclude)*.md'
  ':(exclude)scripts/gate.sh'
  ':(exclude)gate.conf'
  ':(exclude)package-lock.json'
  ':(exclude)yarn.lock'
  ':(exclude)pnpm-lock.yaml'
)

# 追跡ファイルを正規表現で検索する。一致した行を返し、一致が無ければ空を返す。
scan() {
  git grep -n -I -E "$1" -- "${EXCLUDES[@]}" 2>/dev/null
}

printf '\n=== Gate ===\n\n'
printf -- '--- 静的チェック ---\n'

# 1. コンフリクトマーカーの残存
hits="$(scan '^(<{7} |>{7} )')"
if [ -z "$hits" ]; then
  pass 'コンフリクトマーカーが残っていない'
else
  fail 'コンフリクトマーカーが残っている' "$hits"
fi

# 2. 未完成を隠すマーカー（CLAUDE.md 第17章 / docs/ARCHITECTURE.md 第11章）
hits="$(scan '(TODO|FIXME|XXX|HACK)')"
if [ -z "$hits" ]; then
  pass '未完成マーカー（TODO/FIXME/XXX/HACK）が無い'
else
  fail '未完成マーカーが残っている。Taskとして切り出すこと' "$hits"
fi

# 3. 型エラーの隠蔽（CLAUDE.md 第17章）
hits="$(scan '(: *any\b|as +any\b|@ts-ignore|@ts-nocheck)')"
if [ -z "$hits" ]; then
  pass '型エラーの隠蔽（any / ts-ignore）が無い'
else
  fail '型エラーを隠している箇所がある' "$hits"
fi

# 4. 追跡してはいけないファイル（秘密情報・生成物）
UNEXPECTED='(^|/)(node_modules|Pods|DerivedData|xcuserdata)/|(^|/)\.DS_Store$|(^|/)\.env($|\.)|\.(p12|mobileprovision|keystore|jks|pem)$'
hits="$(git ls-files | grep -E "$UNEXPECTED" | grep -v -E '\.env\.(example|sample)$')"
if [ -z "$hits" ]; then
  pass '想定外のファイルが追跡されていない'
else
  fail '追跡すべきでないファイルがある' "$hits"
fi

# 5. branch命名（CLAUDE.md 第10章）
branch="${GITHUB_HEAD_REF:-}"
[ -z "$branch" ] && branch="$(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
  printf '  [ SKIP ] branch命名（branchを特定できない）\n'
  SKIP_COUNT=$((SKIP_COUNT + 1))
  SKIPPED_CHECKS+=('branch命名')
elif printf '%s' "$branch" | grep -q -E '^(main|(feature|fix|refactor|chore|docs|test|claude)/.+)$'; then
  pass "branch命名 ($branch)"
else
  fail "branch命名が規約外: $branch" 'main | feature/* | fix/* | refactor/* | chore/* | docs/* | test/* | claude/*'
fi

printf '\n--- 構成依存チェック（gate.conf） ---\n'

GATE_TYPECHECK=""
GATE_LINT=""
GATE_TEST=""
GATE_BUILD=""
GATE_MIGRATION=""
GATE_DEPENDENCY=""
GATE_ARCHITECTURE=""
GATE_DUPLICATION=""
GATE_UNUSED=""

if [ -f gate.conf ]; then
  # shellcheck disable=SC1091
  . ./gate.conf
else
  printf '  gate.conf が無い。構成依存チェックはすべて未設定として扱う。\n'
fi

run_configured() {
  local label="$1" cmd="$2" out status
  if [ -z "$cmd" ]; then
    skip "$label"
    return
  fi
  out="$(mktemp)"
  bash -c "$cmd" >"$out" 2>&1
  status=$?
  if [ "$status" -eq 0 ]; then
    pass "$label ($cmd)"
  else
    fail "$label ($cmd) exit=$status" "$(tail -n 40 "$out")"
  fi
  rm -f "$out"
}

run_configured 'typecheck'    "$GATE_TYPECHECK"
run_configured 'lint'         "$GATE_LINT"
run_configured 'test'         "$GATE_TEST"
run_configured 'build'        "$GATE_BUILD"
run_configured 'migration'    "$GATE_MIGRATION"
run_configured 'dependency'   "$GATE_DEPENDENCY"
run_configured 'architecture' "$GATE_ARCHITECTURE"
run_configured 'duplication'  "$GATE_DUPLICATION"
run_configured 'unused'       "$GATE_UNUSED"

printf '\n--- 結果 ---\n'
printf '  PASS %d / FAIL %d / SKIP %d\n' "$PASS_COUNT" "$FAIL_COUNT" "$SKIP_COUNT"

if [ "$SKIP_COUNT" -gt 0 ]; then
  printf '\n  未設定の検証:\n'
  for c in "${SKIPPED_CHECKS[@]}"; do printf '    - %s\n' "$c"; done
  printf '  技術構成が確定したら gate.conf を埋めること。\n'
fi

if [ "$FAIL_COUNT" -gt 0 ]; then
  printf '\n  失敗した検証:\n'
  for c in "${FAILED_CHECKS[@]}"; do printf '    - %s\n' "$c"; done
  printf '\nGate: FAILED\n\n'
  exit 1
fi

printf '\nGate: PASSED\n\n'
exit 0
