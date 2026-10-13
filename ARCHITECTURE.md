# MarketAtlas architecture

The current app uses Next.js App Router, React, TypeScript, Tailwind, Framer Motion, and Lucide. The homepage is rendered from the local catalog on the server, then category filtering and previews run in the browser without network requests.

## Data flow

1. `data/sources.json` defines a curated list of financial repositories and their category memberships.
2. `scripts/discover.ts` requests GitHub metadata, verifies known Skill/MCP documentation paths, and records daily star snapshots.
3. Local refreshes write `data/cache.json` and `data/history.json`. The optional `--snapshot` flag updates the checked-in `data/catalog.json` fallback.
4. `lib/store.ts` reads local cache or the bundled catalog. A fresh clone therefore has real project results.
5. The homepage and API routes use the same catalog. `lib/catalog.ts` expands each repository’s verified Skill array into independent listings; identities combine repository and manifest path. `lib/artifacts.ts` verifies explicit source paths at pinned commits and records content hashes. Skills and MCP pages filter topics locally and use `FloatingSurface` for pointer tilt and lift, with reduced-motion and touch fallbacks. Skills and MCP routes run dynamically so refreshed data is reflected without a rebuild.

The GitHub token is optional, server-only, and never serialized to the browser. No search API request runs when someone visits the homepage or changes a category.

## Ranking and verification

Popular projects are sorted by total stars, explicitly labeled as popularity. Weekly trending requires real observations spanning seven days, with a baseline no more than one day older than the target. Missing history remains null. Skill entries require a confirmed manifest; MCP entries require source documentation. Publisher status defaults to community, and installation commands are omitted when unverified.

## Interaction

The marketplace-inspired layout uses Space Grotesk, oversized hero typography, numbered Explore links, and rectangular catalog cards. `HomeHero` lazily mounts the user-supplied GradientWaves shader with purple/pink colors, pointer parallax, hidden/offscreen suspension, a pause control, and a static reduced-motion fallback. Rendering is capped at 30 FPS and DPR 1.5; WebGL2 and shader-link failures fall back without mounting a canvas. Geometry, programs, contexts, observers, and listeners are released on unmount. `Navbar` implements an original dark-bar/white-mega-menu pattern using native buttons and links, with Escape focus restoration, outside-click dismissal, and a scrollable mobile panel. `ThemeToggle` uses PixelSwap for its icon and a portal-based page wipe: solid decorative tiles cover the app, the theme changes at the midpoint, then tiles reveal the existing page. The app DOM is never cloned. The theme persists in local storage; repeated toggles are guarded and reduced motion switches immediately.

Browsing retains category counts, animated filters, card hovers, section reveals, sorting, incremental display, and keyboard-accessible previews. Skills, MCP, and Trending remain in desktop and mobile navigation. This revision changes page layout and catalog organization only; it does not add a repository scanner, submission system, or review backend.

`db/migrations/001_init.sql` is an optional schema, not a connected backend. No automated sync workflow or production deployment is configured by these changes.

## GitHub Lab

`readWeeklySnapshot` reads the local weekly cache or bundled fallback independently of the financial catalog. The homepage uses `WeeklyTopTen`, and `/lab` renders `GitHubLab` with optional initial repository selection from its URL. Rankings, comparison, and current-snapshot favorites run locally in the browser. `RepoRadar` uses native SVG and the existing motion library with relative scaling and reduced-motion support. Favorites use the stable GitHub repository ID and browser storage; they do not star repositories on GitHub.

`refresh-weekly.ts` reads the public GitHub weekly Trending feed and verifies ten repositories via REST. It captures optional contributor/default-branch commit counts and writes the snapshot only after required metadata succeeds. No chart dependency, account integration, database, or public deployment is added.
