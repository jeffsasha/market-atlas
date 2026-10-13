# MarketAtlas Discovery Redesign Implementation Plan

> Execute inline in the existing application using the supplied design brief. The initial implementation stays local; commit, push, and production deployment require subsequent explicit owner approval.

**Goal:** Refine the hero, background, shared search, and US-equity/crypto ticker while preserving all routes and discovery sections.

**Architecture:** Keep Next.js App Router and the file-backed catalog. A layout-level palette receives a compact server-built index; the search API uses the same pure search functions. A single CSS dot field supplies the global backdrop. Adapt public React Bits StrokeText for mount-only SVG drawing. Use the official TradingView ticker embed rather than redistributing scraped quotes.

**Stack:** Existing React, TypeScript, Tailwind, GSAP, Framer Motion; no new dependency.

**Spec:** User-supplied “Redesign Hero Section, Global Background, Search UX, and Live Market Ticker” brief.

## Constraints and review focus

- Preserve OPEN TOOLS. REAL EDGE., lower homepage sections, theme switching, Lab, Skills, MCP, and repository routes.
- No cursor effects or animation loop in the background renderer; quiet CSS ambient opacity only.
- Search actual projects and individual Skills/MCP sources, with correct destinations and unique identities.
- Handle whitespace, case, multiple words, invalid limits, empty results, and repeated keyboard openings.
- Keep heading geometry stable and visible before hydration; reduced motion renders the final state.
- Quotes must come from TradingView, with equity delay and provider attribution visible. Unavailable must never become zero or invented quotes.
- Test focus trapping/restoration, keyboard selection, theme changes, small screens, blocked widget, and shared-background continuity.

## Tasks

- [x] 1. Write and run failing search tests for category text, multi-word/case-insensitive matching, individual Skills, MCP scopes, unique IDs, and valid destinations. Implement `buildSearchIndex(repos)` and `searchCatalog(index, query, kind, limit)` in `lib/search.ts`; reuse them in `app/api/search/route.ts`.
- [x] 2. Replace the inactive palette implementation in `components/CommandPalette.tsx`. Add global shortcuts, result scopes, loading-free local search, active-descendant navigation, dialog focus trap, scroll lock, and focus restoration. Mount it once from `app/layout.tsx` and add an accessible navigation search trigger.
- [x] 3. Refactor `components/DotField/` to decorative CSS dots with no input listeners or canvas. Add `GlobalBackground`, theme tokens, quiet surface styles, and an ambient-motion control in the footer. Reduce existing floating hover motion.
- [x] 4. Adapt `components/StrokeText.tsx` from the public upstream source for mount-only drawing/filling with an SSR text fallback and stable geometry. Redesign `HomeHero` with the exact copy, hero search, real-category suggestions, and dynamic counts.
- [x] 5. Add `MarketTicker` under navigation using the official embed and all twelve requested instruments. Preserve provider attribution, delayed labels, loading/unavailable layout, theme behavior, and an accessible fallback. Verify provider-owned scrolling and pause behavior; document any external-widget limitations.
- [x] 6. Update README, design, and architecture documentation. Run tests, type checks, build, and browser flows for search, routes, ticker, themes, responsive layout, and reduced motion. Save preview screenshots and provide local preview instructions without publishing.
