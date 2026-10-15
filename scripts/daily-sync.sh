#!/usr/bin/env bash
# MarketAtlas daily sync: discover new finance skills / MCP servers / AI agents /
# top-starred finance projects, refresh the catalog, run tests, commit + push.
# Intended to run from the daily cron; safe to run manually too.
#
# GitHub auth: resolved at runtime via the secure credential surrogate
# (custom.github). The surrogate is substituted by the egress proxy and is
# never written to disk or logs.
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

GITHUB_TOKEN="$(python3 - <<'EOF'
import sys
sys.path.insert(0, "/opt/muse/skills/custom-connector-setup/bin")
from dynamic_credentials import dynamic_credential_entry
sys.stdout.write(dynamic_credential_entry("custom.github", "access_token")["surrogate"].strip())
EOF
)"
export GITHUB_TOKEN

echo "=== $(date -u +%FT%TZ) daily sync start ==="

# 1. Sync with remote (fail loud on divergence so no work is silently lost).
git fetch origin
git merge --ff-only origin/main

# 2. Discover new finance skills / MCP / agents / top-starred projects.
./node_modules/.bin/tsx scripts/discover-new.ts --max-add=10

# 3. Refresh stats + artifacts for all sources, write data/catalog.json snapshot.
./node_modules/.bin/tsx scripts/discover.ts --snapshot

# 4. Regression gate: do not push broken data.
npm test --silent

# 5. Commit + push if anything changed.
git add data/ scripts/
if git diff --cached --quiet; then
  echo "No catalog changes; nothing to commit."
else
  git -c user.name="marketatlas-bot" -c user.email="bot@market-atlas.local" \
    commit -m "Daily sync: catalog refresh + new finance skills/MCP/agents ($(date -u +%F))"
  # NOTE: plain `git push` cannot work here — the stored GitHub credential is
  # only valid for api.github.com, not git-over-HTTPS. Push via the Git Data API.
  python3 scripts/git_push_api.py jeffsasha/market-atlas
  echo "Pushed; Vercel auto-deploy will update https://market-atlas-indol.vercel.app/"
fi

echo "=== daily sync done ==="
