# Discovery redesign

## Changed files and components

- `components/HomeHero.tsx`: exact headline/copy, controlled hero spacing, shared search entry, live catalog counts.
- `components/StrokeText.tsx` (new): public React Bits SVG/GSAP adaptation, mount-only draw/fill, readable SSR fallback, stable dimensions, reduced motion.
- `components/HeroSearch.tsx` (new), `components/CommandPalette.tsx`, `lib/search.ts` (new), `app/api/search/route.ts`: one catalog search engine, category scopes, shortcuts, keyboard selection, focus trap/restoration, empty results.
- `components/GlobalBackground.tsx` (new), `components/DotField/`, `app/globals.css`: one shared CSS dot background, theme tokens, zero cursor tracking, mobile/reduced-motion static mode, a brief desktop ambient entrance.
- `components/MarketTicker.tsx` (new): official TradingView embed for all twelve requested instruments, delayed-data labels, loading/unavailable layout, retry, and keyboard-accessible symbol menu.
- `app/layout.tsx`, `app/page.tsx`, `components/Navbar.tsx`: shared layout integration, server-built search index, and navigation search.
- `components/FloatingSurface.tsx`, `app/design/page.tsx`: restrained surface feedback and updated gallery description.
- `tests/search.test.ts`: real catalog search cases; README, architecture, design, and DotField documentation updated.

## Provider and freshness

TradingView supplies the quote values and market status inside its official widget. Equities are visibly marked delayed; the verified provider tooltip reports 15 minutes. Crypto quotes use Coinbase instruments. There is no host-owned polling interval or invented last-quote timestamp. Exchange restrictions, market hours, and availability remain provider-controlled. Attribution and branding remain visible. Embedding does not grant data-extraction or redistribution rights.

The provider handles seamless scrolling, hover pause, and reduced-motion manual scrolling. The Markets menu provides stable keyboard-accessible symbol links. The host handles failed script/iframe loading, while provider-internal symbol errors remain in its own UI. A loaded iframe alone cannot confirm every quote is available.

## Preview and verification

Local development: run `npm run dev` and open the address printed by Next.js (normally http://localhost:3000/).

From the repository: `npm ci`, then `npm run dev`. For a separate production preview: `MARKETATLAS_DIST_DIR=.next-redesign npm run build`, then `MARKETATLAS_DIST_DIR=.next-redesign npm start -- --hostname 127.0.0.1 --port 3005`.

No new environment variables or market-data API keys are required. The existing optional `GITHUB_TOKEN` remains server-only for catalog refreshes.

All 12 tests, TypeScript checking, and production build pass. Browser checks cover actual prices for all twelve instruments, delayed labels, provider failure fallback, shortcuts, repeated shortcut focus, arrow/Enter navigation, focus trapping/restoration, Skills/MCP/Lab routes, themes, and mobile overflow. The headline kept identical geometry from animation to completion. The page has one dot-field layer and zero canvases.

The repository's pre-existing `npm run lint` script is not configured: Next.js asks to set up ESLint. No successful standalone lint result is claimed. Build/compiler and TypeScript checks pass.

Release target: the existing `jeffsasha/market-atlas` GitHub repository on `main` and its existing Vercel production project. Publishing requires explicit owner approval.
