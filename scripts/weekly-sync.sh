#!/usr/bin/env bash
# MarketAtlas weekly leaderboard sync: refresh the GitHub Lab weekly top-10
# snapshot (data/github-weekly.json) from GitHub Trending, then commit + push.
# Intended to run from the weekly cron; safe to run manually too.
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

echo "=== $(date -u +%FT%TZ) weekly sync start ==="

# 1. Sync with remote (fail loud on divergence so no work is silently lost).
git fetch origin
git merge --ff-only origin/main

# 2. Refresh the weekly trending snapshot (keeps the previous snapshot if the
#    trending source is unavailable or returns too few candidates).
./node_modules/.bin/tsx scripts/refresh-weekly.ts --snapshot

# 3. Commit + push if the snapshot changed. (No test gate: refresh-weekly.ts
#    already validates the snapshot shape before writing.)
git add data/github-weekly.json
if git diff --cached --quiet; then
  echo "No weekly changes; nothing to commit."
else
  git -c user.name="marketatlas-bot" -c user.email="bot@market-atlas.local" \
    commit -m "Weekly leaderboard refresh ($(date -u +%F))"
  # NOTE: plain `git push` cannot work here — the stored GitHub credential is
  # only valid for api.github.com, not git-over-HTTPS. Push via the Git Data API.
  python3 scripts/git_push_api.py jeffsasha/market-atlas
  echo "Pushed; Vercel auto-deploy will update https://market-atlas-indol.vercel.app/"
fi

echo "=== weekly sync done ==="
