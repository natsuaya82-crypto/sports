#!/usr/bin/env bash
#
# Architecture check — src/README.md が定義するレイヤ境界を検証する。
#
# 依存の向き: ui -> data -> domain 。lib は誰にも依存しない。
# 対象ファイルが無い場合は何も検出せず成功する。

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT" || exit 2

VIOLATIONS=0

# import / require の指定先が、あるレイヤを指しているかを見る。
imports_layer() {
  printf '(from|require\\()[[:space:]]*['"'"'"][^'"'"'"]*\\b(%s)/' "$1"
}

report() {
  VIOLATIONS=$((VIOLATIONS + 1))
  printf '  [ NG ] %s\n' "$1"
  printf '%s\n' "$2" | sed 's/^/         | /'
}

# $1: 検査するパス, $2: 参照を禁止するレイヤ（| 区切り）, $3: 理由
forbid_layer_import() {
  local path="$1" layers="$2" why="$3" hits
  [ -d "$path" ] || return 0
  hits="$(git grep -n -I -E "$(imports_layer "$layers")" -- "$path" ':(exclude)*.md' 2>/dev/null)"
  [ -z "$hits" ] && return 0
  report "$why" "$hits"
}

# $1: パターン, $2: 検査対象外にするパス, $3: 理由
forbid_pattern_outside() {
  local pattern="$1" allowed="$2" why="$3" hits
  hits="$(git grep -n -I -E "$pattern" -- 'src' ':(exclude)*.md' ":(exclude)$allowed" 2>/dev/null)"
  [ -z "$hits" ] && return 0
  report "$why" "$hits"
}

printf '\n--- architecture ---\n'

forbid_layer_import 'src/domain' 'data|ui' \
  'domain が data / ui を参照している。domain は依存の終端でなければならない'

forbid_layer_import 'src/data' 'ui' \
  'data が ui を参照している。依存の向きは ui -> data'

forbid_layer_import 'src/lib' 'domain|data|ui' \
  'lib が他レイヤを参照している。lib はドメイン知識を持たない'

forbid_pattern_outside "(from|require\\()[[:space:]]*['\"]react-native(['\"/])" 'src/ui' \
  'ui の外で react-native を参照している。UIフレームワークへの依存は ui に閉じる'

forbid_pattern_outside "@supabase/supabase-js" 'src/data' \
  'data の外で Supabase クライアントを参照している。データアクセスは data に集約する'

if [ "$VIOLATIONS" -gt 0 ]; then
  printf '\narchitecture: %d violation(s)\n' "$VIOLATIONS"
  printf '境界の変更が必要な場合は実装せずLeaderへ報告する。\n\n'
  exit 1
fi

printf '  [ OK ] レイヤ境界に違反なし\n\n'
exit 0
