<div align="center">

# MarketAtlas

**Open tools. Real edge.**

Discover financial research projects, agent skills, and MCP servers—then explore what is gaining attention across GitHub.

[![CI](https://github.com/jeffsasha/market-atlas/actions/workflows/ci.yml/badge.svg)](https://github.com/jeffsasha/market-atlas/actions/workflows/ci.yml)
[![GitHub stars](https://img.shields.io/github/stars/jeffsasha/market-atlas?style=flat&color=a855f7)](https://github.com/jeffsasha/market-atlas/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/jeffsasha/market-atlas?color=ec4899)](https://github.com/jeffsasha/market-atlas/commits/main)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-149eca?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[Features](#features) · [Quick start](#quick-start) · [GitHub Lab](#github-lab) · [Data](#real-github-data) · [Contributing](CONTRIBUTING.md)

</div>

![GitHub Lab: weekly rankings, repository facts, and an interactive radar comparison](docs/images/github-lab.jpg)

## Features

| Explore | What you can do |
| --- | --- |
| **Projects** | Browse 38 curated GitHub repositories across 11 finance and crypto categories; filter, sort, and open repository previews. |
| **Skills** | Discover 25 individual agent skills with verified source manifests, pinned revisions, topic filters, and upstream links. |
| **MCP servers** | Explore 8 documented financial data connections with source and setup links. |
| **GitHub Lab** | Follow a weekly top 10 across all project categories, inspect repository profiles, compare radar charts, and save favorites locally. |
| **Trending** | Explore financial community favorites and verified weekly growth when enough history is available. |
| **Design gallery** | Preview the site's components and their usage examples at `/design`. |

Purple and pink GradientWaves, pointer-responsive floating surfaces, a dark navigation bar with a white mega menu, and a PixelSwap theme transition bring the catalog to life. Light and dark themes persist on your device. Keyboard navigation, repository-preview focus handling, reduced-motion support, a background pause control, and a static gradient fallback are included.

## Quick start

Use **Node.js 22 LTS** and npm.

```bash
git clone https://github.com/jeffsasha/market-atlas.git
cd market-atlas
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). The bundled catalog works without a GitHub account, API token, database, or React Bits Pro license.

For a production build:

```bash
npm run build
npm start
```

<details>
<summary><strong>Optional environment variables and a separate preview</strong></summary>

Copy `.env.example` to `.env.local` if you need a local environment file. The web app loads it through Next.js. For standalone refresh scripts, export `GITHUB_TOKEN` in your shell before running them; those scripts do not load `.env.local` automatically.

| Variable | Purpose | Required? |
| --- | --- | --- |
| `GITHUB_TOKEN` | Higher API limits when refreshing repository metadata. Keep it server-side. | No |
| `MARKETATLAS_DIST_DIR` | Separate build output when another preview is running. | No |

For an isolated preview:

```bash
MARKETATLAS_DIST_DIR=.next-preview npm run build
MARKETATLAS_DIST_DIR=.next-preview npm start -- --hostname 127.0.0.1 --port 3003
```

</details>

## GitHub Lab

The homepage's weekly top 10 links directly to repository profiles at `/lab`. The Lab covers **all languages and all project categories** in GitHub's public weekly Trending selection, ranked by its reported weekly stars. The selection is not an exhaustive ranking of every GitHub repository.

Profiles show total stars, forks, contributors, weekly stars, seven-day default-branch commits, language, license, and creation date. The radar chart scales each metric against the largest value in the same top ten. Compare a second project to see the profiles together; select a metric to inspect its raw values.

Favorites are saved on the visitor's device using repository IDs. They do not change GitHub stars, and the Favorites view shows saved projects present in the current snapshot.

```bash
npm run refresh:weekly -- --snapshot
```

The checked-in fallback is `data/github-weekly.json`; the latest local refresh is `data/weekly-cache.json`. Capture time appears in the UI. Refreshes are manual, preserve the previous snapshot on incomplete feeds or required metadata failures, and keep unavailable optional metrics empty.

## Real GitHub data

The catalog mirrors **metadata and links** to upstream projects. It does not bundle their packages, run their instructions, or copy their credentials.

| File | Role |
| --- | --- |
| `data/sources.json` | Curated repositories, Skill source paths, and MCP documentation paths. |
| `data/catalog.json` | Bundled financial catalog, available immediately after cloning. |
| `data/cache.json` | Ignored latest local financial-catalog refresh. |
| `data/history.json` | Ignored daily observations used to calculate real seven-day growth. |
| `data/github-weekly.json` | Bundled GitHub Lab snapshot. |
| `data/weekly-cache.json` | Ignored latest local Lab refresh. |

```bash
# Refresh the financial catalog.
npm run discover

# Also update the bundled fallback; review the resulting data diff.
npm run discover -- --snapshot

# Refresh just one source.
npm run discover -- --only=alpacahq/alpaca-mcp-server --snapshot
```

Repository facts come from GitHub, while category memberships are editorial. Skills require actual source manifests, and MCP entries require repository documentation. Source verification confirms discovery metadata; it is not a security audit or endorsement.

Financial weekly growth requires an observation seven to eight days old. Until that history exists, the financial Trending section is labeled **Popular right now** and sorts by total stars. No automatic refresh schedule or live database is configured. The optional schema under `db/migrations/` is not connected to the current file-backed app.

## Development

```bash
npm test
npm run build
npm run typecheck
```

GitHub Actions runs these checks on pushes to `main` and `codex/**` branches, and on pull requests. Tests cover catalog categories, stable Skill identities, source provenance, manifest parsing, weekly ranking, and radar normalization. Browser verification covers filtering, previews, themes, Lab comparisons, favorites after reload, and mobile layout.

```text
app/                     Pages and API routes
components/              Navigation, cards, motion, previews, and charts
data/                    Bundled catalogs and source manifest
lib/                     GitHub client, filtering, provenance, and snapshots
scripts/discover.ts      Financial catalog refresh
scripts/refresh-weekly.ts GitHub Lab refresh
tests/                   Data and ranking checks
docs/images/             README screenshots
.github/workflows/       Automated validation
```

## Documentation and contributions

- [Architecture](ARCHITECTURE.md) — routes, components, and data flow.
- [Data ingestion](DATA_INGESTION.md) — source verification and snapshot rules.
- [Design system](DESIGN_SYSTEM.md) — colors, typography, motion, and accessibility.
- [Contributing](CONTRIBUTING.md) — local checks and adding catalog sources.
- [Report an issue](https://github.com/jeffsasha/market-atlas/issues) — bugs and feature requests.

Space Grotesk is bundled locally under the [SIL Open Font License](app/fonts/OFL.txt), so builds do not fetch it from Google Fonts.

React Bits components retain their [upstream attribution and terms](components/LICENSE.react-bits.md). No React Bits Pro component or license key is included. Indexed projects retain their own licenses; check upstream terms before using them.
