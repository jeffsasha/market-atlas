# Design System — MarketAtlas

## Philosophy
Silicon Valley minimalism. Linear / Vercel / Raycast / Apple / GitHub / Stripe.

Avoid: oversized gradients, glassmorphism excess, neon purple, generic SaaS illustrations, large empty heroes, excessive rounded cards, distracting animations.

Prefer: exceptional typography, monochromatic surfaces, subtle borders, calibrated spacing, soft shadows, restrained accents, micro-interactions, data density.

## Typography
- Sans: Inter (fallback Geist). Headings tight tracking.
- Mono: JetBrains Mono / ui-monospace for stats, metadata, install commands, versions, classifications.

## Themes
- Light: warm white #FAFAF9 bg, #E7E5E4 borders, #1C1917 text, minimal shadows.
- Dark: near-black #0A0A0B bg (not pure black), charcoal #131316 cards, #27272A borders, #EDEDED text.
- Toggle in top nav, sun/moon transition, persisted to localStorage, respects prefers-color-scheme, no flash (inline script in layout).

## Components
- Sticky nav with backdrop blur, 3 zones (logo | links | search+github+theme).
- Cards: 1px border, 8px radius max, hover: border darkens + translateY(-1px) + soft shadow.
- Tables: mono numerals, row hover.
- Command palette (Cmd+K): floating, blurred backdrop, instant suggestions, keyboard nav, history in localStorage.
- Floating repo preview: right-side panel, Escape/outside to close, focus trap.
- Tooltips: subtle, for stars/forks/growth definitions.
- Motion: Framer Motion, transform+opacity only, 60fps, prefers-reduced-motion respected.

## Accent
Single restrained accent: emerald #10B981 for growth/positive, amber for warnings, otherwise neutral.
