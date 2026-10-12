# MarketAtlas

An open-source financial research & AI tools discovery platform. Discover GitHub repositories, AI Agent Skills, and MCP servers for US equities, quant, crypto, and financial data.

**Design:** Linear / Vercel / Raycast minimalism. Light + dark + system theme, command palette (⌘K), floating repo previews.

> **Data integrity:** All repository stats come from the real GitHub API. No mock data, no fabricated stars, no hardcoded trending. Trending shows 7-day growth only when snapshot history exists; otherwise it displays “— growth n/a”.

## Quickstart

```bash
cd market-atlas
npm install
cp .env.example .env   # set GITHUB_TOKEN

# pull real GitHub data (writes data/cache.json)
npm run discover
# or: python3 scripts/seed_real2.py  (uses connected GitHub credential)

npm run dev
```

Open http://localhost:3000.

## Scripts

- `npm run dev` — Next.js dev
- `npm run build` / `npm start` — production
- `npm run discover` — real GitHub discovery → `data/cache.json` (needs `GITHUB_TOKEN`)

## Database (Supabase, free tier)

Schema: `db/migrations/001_init.sql`. Apply in Supabase SQL editor.

Tables: `repositories`, `repository_snapshots` (for real trending), `skills`, `mcp_servers`, `categories`, `sync_jobs`.

For MVP without Supabase, the app serves `data/cache.json` (populated only from the GitHub API).

To compute real trending in production: run discovery on a schedule (see `.github/workflows/sync.yml` — every 6h), insert a snapshot row per repo per run, then `stars_growth_7d = latest.stars - earliest.stars WHERE captured_at >= now() - interval '7 days'`.

## React Bits Pro — TypographicWall (licensed)

The spec requires the **real** React Bits Pro `TypographicWall`. It is a licensed dependency.

- Not installed in this repo (no license key provided).
- Integration point: `components/TypographicWall.tsx` (currently a restrained placeholder, clearly marked — not presented as the real component).
- To enable: follow `components/TypographicWall/README.md`:
  1. Configure `components.json` registries per https://pro.reactbits.dev/docs/installation
  2. Set `REACTBITS_LICENSE_KEY` (env only, never commit, never expose to client)
  3. `npx shadcn@latest add @reactbits-starter/typographic-wall-tw`
  4. Replace the placeholder with the real import.

Do not bypass licensing. If you need access, request credentials from React Bits.

## Project structure

```
app/                  Next.js App Router pages + API routes
  api/repositories    search/filter/sort (real data)
  api/trending        verified 7-day growth only
  api/search          command-palette search
  api/skills, api/mcp
  repositories/       directory + [owner]/[repo] detail
  skills/, mcp/, trending/
components/           Navbar, RepoCard, RepoPreview, CommandPalette, TypographicWall
lib/                  github.ts (server-only), store.ts, categories.ts
scripts/              discover.ts (TS), seed_real2.py (real-data seeder)
db/migrations/        Supabase Postgres schema
.github/workflows/   sync.yml (every 6h)
```

## Deployment (free tier)

- **Vercel:** import repo, set `GITHUB_TOKEN` env, deploy. No paid services required.
- **Supabase:** create free project, run `db/migrations/001_init.sql`, set `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
- **Automation:** `sync.yml` runs discovery every 6h via GitHub Actions (free).

## Data verification (2026-10-12)

Seeded 89 real repositories via GitHub Search API. Top by stars:
- `ZhuLinsen/daily_stock_analysis` ★66238
- `freqtrade/freqtrade` ★55306
- `ccxt/ccxt` ★44340
- `QuantConnect/Lean` ★21967
- `hummingbot/hummingbot` ★20415

All stats in `data/cache.json` are verbatim from the API at seed time.

## License

MIT — see LICENSE (add one before publishing).
