#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FORCE=false

if [[ "${1:-}" == "--force" ]]; then
  FORCE=true
fi

copy_env() {
  local example="$1"
  local target="${example%.example}"

  if [[ -f "$target" && "$FORCE" != true ]]; then
    echo "skip: $target (already exists, use --force to overwrite)"
    return
  fi

  cp "$example" "$target"
  echo "created: $target"
}

shopt -s nullglob
for example in "$ROOT_DIR"/apps/*/.env.example; do
  copy_env "$example"
done
