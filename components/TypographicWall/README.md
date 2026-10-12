# Typographic Wall — React Bits Pro (licensed)

This directory is the integration point for the **real** `TypographicWall` component from React Bits Pro.

## Status
Not installed — requires a valid `REACTBITS_LICENSE_KEY` and private registry access.
We do not ship a fake imitation, per the product spec.

## To enable (owner action)
1. Ensure `components.json` has the React Bits Pro registries (https://pro.reactbits.dev/docs/installation).
2. Set env (server-side only, never commit):
   ```
   REACTBITS_LICENSE_KEY=rbk_...
   ```
   Configure the Authorization header for the private registry per docs.
3. Install:
   ```
   npx shadcn@latest add @reactbits-starter/typographic-wall-tw
   ```
4. Replace `components/TypographicWall.tsx` fallback with:
   ```tsx
   import { TypographicWall } from '@/components/ui/typographic-wall';
   export default function Wall() {
     return <TypographicWall words={[...]} className="..." />;
   }
   ```
   Words: FINANCIAL INTELLIGENCE, OPEN SOURCE RESEARCH, QUANTITATIVE SYSTEMS, CRYPTO ANALYTICS, MARKET DISCOVERY, AI FINANCE, ALGORITHMIC TRADING, DATA DRIVEN INVESTING.

## Fallback
`components/TypographicWall.tsx` renders a restrained, accessible static word-stack with a subtle decode animation (CSS only) when the licensed component is absent. It respects `prefers-reduced-motion` and is clearly marked as a placeholder, not the React Bits component.
