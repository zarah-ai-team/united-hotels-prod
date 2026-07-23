#!/usr/bin/env bash
#
# Runs ON THE DROPLET, invoked over SSH by .github/workflows/deploy.yml.
# It expects these to already be in /tmp (scp'd by the workflow):
#   /tmp/web-next-standalone.tar.gz   the built Next standalone bundle
#   /tmp/ecosystem.config.cjs         PM2 config for the frontend
#
# What it does, fail-fast (`set -euo pipefail`) at every step:
#   1. Fast-forward the backend/pricing source to origin/main (records the old
#      SHA for rollback). `.env` is gitignored, so secrets are never touched.
#   2. `npm ci` for backend + pricing ONLY when their lockfile changed (the
#      512MB box is slow — skip needless installs).
#   3. Stage the new frontend bundle beside the live one, then atomically swap,
#      keeping the previous bundle as .prev for rollback.
#   4. Reload all three PM2 apps.
#   5. Health-check (with retries). If anything is unhealthy, roll BOTH the
#      frontend bundle and the git source back and reload — then exit non-zero
#      so the GitHub Action shows red.
#
# Safe to run by hand on the droplet too (it's the same thing CI runs).
set -euo pipefail

REPO=/root/united-hotels-prod
LIVE=/var/www/unitedhotels-next
BUNDLE=/tmp/web-next-standalone.tar.gz
ECO=/tmp/ecosystem.config.cjs

log() { printf '\n\033[36m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[31mFATAL: %s\033[0m\n' "$*" >&2; exit 1; }

# ---- guards -----------------------------------------------------------------
[ -f "$BUNDLE" ]     || die "$BUNDLE missing (workflow should have scp'd it)"
[ -d "$REPO/.git" ]  || die "git repo not found at $REPO"
command -v pm2 >/dev/null || die "pm2 not on PATH"
command -v npm >/dev/null || die "npm not on PATH"

# ---- 1. update backend + pricing source ------------------------------------
log "Updating source in $REPO"
cd "$REPO"
PREV_SHA=$(git rev-parse HEAD)
git fetch --prune origin main
git reset --hard origin/main
NEW_SHA=$(git rev-parse HEAD)
echo "source: $PREV_SHA -> $NEW_SHA"

# ---- 2. install deps only when the lockfile actually changed ----------------
changed() { git diff --name-only "$PREV_SHA" "$NEW_SHA" | grep -qE "$1"; }
ensure_deps() { # <dir> <lockfile-path-regex>
  local dir="$1" re="$2"
  if [ ! -d "$dir/node_modules" ] || changed "$re"; then
    log "Installing deps in $dir"
    ( cd "$dir" && npm ci --omit=dev )
  else
    echo "deps unchanged in $dir — skipping npm ci"
  fi
}
ensure_deps "$REPO" '^package(-lock)?\.json$'
ensure_deps "$REPO/pricing-engine-v2" '^pricing-engine-v2/package(-lock)?\.json$'

# ---- 3. stage + atomically swap the frontend bundle -------------------------
log "Staging new frontend bundle"
rm -rf "$LIVE.new"
mkdir -p "$LIVE.new"
tar -xzf "$BUNDLE" -C "$LIVE.new"
[ -f "$LIVE.new/server.js" ] || die "server.js missing in bundle — refusing to swap"
cp "$ECO" "$LIVE.new/ecosystem.config.cjs" 2>/dev/null || true

rm -rf "$LIVE.prev"
[ -d "$LIVE" ] && mv "$LIVE" "$LIVE.prev"
mv "$LIVE.new" "$LIVE"

# ---- 4. reload PM2 (start if a process is missing) --------------------------
log "Reloading PM2"
pm2 reload backend        || pm2 start server.js --name backend --cwd "$REPO"
pm2 reload pricing-engine || pm2 start src/server.js --name pricing-engine --cwd "$REPO/pricing-engine-v2"
pm2 startOrReload "$LIVE/ecosystem.config.cjs" --update-env
pm2 save

# ---- 5. health check with retries, auto-rollback on failure -----------------
log "Health check"
wait_ok() { # <url>
  local url="$1"
  for _ in $(seq 1 10); do
    curl -fsS -o /dev/null --max-time 5 "$url" && return 0
    sleep 2
  done
  return 1
}

ok=1
wait_ok http://127.0.0.1:5000/api/health || ok=0   # backend
wait_ok http://127.0.0.1:3000/            || ok=0   # frontend page
wait_ok http://127.0.0.1:3000/api/health  || ok=0   # BFF -> backend chain
# pricing has no /health route; it's non-fatal (backend falls back to legacy).

if [ "$ok" -ne 1 ]; then
  log "HEALTH CHECK FAILED — rolling back to $PREV_SHA"
  # frontend
  if [ -d "$LIVE.prev" ]; then rm -rf "$LIVE"; mv "$LIVE.prev" "$LIVE"; fi
  # backend + pricing source
  cd "$REPO"
  git reset --hard "$PREV_SHA"
  npm ci --omit=dev
  ( cd pricing-engine-v2 && npm ci --omit=dev )
  pm2 reload backend pricing-engine || true
  pm2 startOrReload "$LIVE/ecosystem.config.cjs" --update-env || true
  pm2 save
  die "rolled back — site restored to previous release"
fi

log "Deploy OK ($NEW_SHA)"
rm -rf "$LIVE.prev"
rm -f "$BUNDLE" "$ECO"
