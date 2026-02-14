#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-$ROOT_DIR/dist/booking-project}"

rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"

copy_file() {
  local src="$1"
  local dst_dir="$2"
  mkdir -p "$dst_dir"
  cp "$src" "$dst_dir/"
}

copy_dir() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  cp -R "$src" "$dst"
}

# Root workspace files needed to run the monorepo
copy_file "$ROOT_DIR/package.json" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/pnpm-lock.yaml" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/pnpm-workspace.yaml" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/tsconfig.base.json" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/.eslintrc.cjs" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/.gitignore" "$OUTPUT_DIR"

# CI / hardening docs
copy_dir "$ROOT_DIR/.github" "$OUTPUT_DIR/.github"
copy_file "$ROOT_DIR/RELEASE_CHECKLIST.md" "$OUTPUT_DIR"
copy_file "$ROOT_DIR/GO_LIVE_SIGNOFF_PROMPT.md" "$OUTPUT_DIR"

# Booking runtime components
copy_dir "$ROOT_DIR/apps/api" "$OUTPUT_DIR/apps/api"
copy_dir "$ROOT_DIR/apps/web" "$OUTPUT_DIR/apps/web"
copy_dir "$ROOT_DIR/packages/core" "$OUTPUT_DIR/packages/core"
copy_dir "$ROOT_DIR/packages/integrations" "$OUTPUT_DIR/packages/integrations"
copy_dir "$ROOT_DIR/packages/widget" "$OUTPUT_DIR/packages/widget"
copy_dir "$ROOT_DIR/supabase" "$OUTPUT_DIR/supabase"
copy_dir "$ROOT_DIR/docker" "$OUTPUT_DIR/docker"

# Keep a focused README for the extracted project
cat > "$OUTPUT_DIR/README.md" <<'README'
# BookingGG (Extracted)

This is a clean booking-only export of the monorepo containing:
- Frontend PWA + Admin Dashboard: `apps/web`
- Backend API: `apps/api`
- Shared packages: `packages/core`, `packages/integrations`, `packages/widget`
- DB + infra: `supabase`, `docker`

## Quick start
```bash
pnpm install
pnpm -r lint
pnpm -r test
pnpm -r build
```
README

printf "\n✅ Booking-only project extracted to: %s\n" "$OUTPUT_DIR"
