# Data Ingestion Strategy

## Sources
Primary: GitHub REST API (server-side, token from env `GITHUB_TOKEN`). Never expose to client.

## Discovery Queries (category-specific, not single broad search)
- `stock analysis language:python stars:>100`
- `financial modeling language:python`
- `quantitative finance backtest`
- `algorithmic trading framework`
- `portfolio optimization python`
- `cryptocurrency trading bot`
- `blockchain analytics`
- `defi analytics`
- `financial data api`
- `ai agent finance`
- `mcp server finance` / `model context protocol stocks`
- `agent skill finance` / `SKILL.md finance`

Each query paginated (max 100/page, up to 10 pages per query to respect search rate limits: 30 req/min authenticated).

## Ranking
score = 0.4*log(stars+1) + 0.3*recency(pushed_at) + 0.2*maintenance(open_issues ratio, release cadence) + 0.1*docs(README length, topics, license)

Trending (weekly) = stars_today - stars_7d_ago from `repository_snapshots`. Display only if ≥2 snapshots; otherwise show "—" with tooltip "insufficient history", never total stars as growth.

## Deduplication & Normalization
- Key: `github_id` (stable). Also unique(owner,name) case-insensitive.
- Normalize: trim description, lower topics, coerce nulls → distinguish unavailable vs 0 in UI.

## Rate Limits / Resilience
- Authenticated: 5000 req/hr core, 30/min search.
- Backoff on 403 rate-limit: read `x-ratelimit-reset`, sleep.
- Retry: 3x exponential for 5xx.
- Idempotent upserts: `on conflict (github_id) do update`.
- Incremental: only re-fetch repos with `pushed_at > last_sync - 1d` or new.

## Verification
- Skills: GET `/repos/{owner}/{repo}/contents/SKILL.md` (and `skills/`, `.claude/skills/`). Only list on 200.
- MCP: check topics contains `mcp`, or package.json has `@modelcontextprotocol/*`, or README matches `/mcp server/i` + config snippet. Publisher official only if owner matches known org (e.g. `modelcontextprotocol`) or repo states "official".
- Install commands: extract from README code blocks only; never invent.

## Scheduling
- GitHub Actions `.github/workflows/sync.yml`: cron `0 */6 * * *` (every 6h), runs `scripts/discover.ts`.
- Logs to `sync_jobs` table.

## Timestamps
Track `discovered_at`, `last_synced_at`, `source_url`, `verification_status` per spec.
