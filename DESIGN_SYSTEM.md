# Design system — MarketAtlas

## Visual direction

A browse-first marketplace with large, tightly tracked headlines, clear repository metadata, and purple/pink accents. The dark navigation opens a white mega menu. Content stays readable over quiet surfaces; the animated hero provides atmosphere.

## Typography and color

- Space Grotesk for headings and interface text; system monospace for metrics and metadata.
- Light surfaces use warm white and pale neutral borders. Dark surfaces use near-black and charcoal.
- Purple (`#a855f7`) identifies the selected repository and chart. Pink (`#ec4899`) identifies comparisons and secondary accents.
- Theme-specific contrast and focus styles live in `app/globals.css` and the components.

## Navigation and discovery

- The homepage leads into the weekly GitHub top ten, financial favorites, Explore links, and category-based discovery.
- The primary navigation links Skills, MCP Servers, GitHub Lab, and Trending. Explore reveals the catalog destinations; its footer links the component gallery.
- Repository cards open a preview with focus handling, Escape dismissal, and focus restoration.
- The Lab uses a ranked list, a repository overview, a relative radar chart, a comparison selector, and device-local favorites.

## Motion and accessibility

- GradientWaves uses purple/pink waves with pointer parallax, capped at 30 FPS and DPR 1.5. It pauses while offscreen or hidden and has a visible pause control and static fallback.
- PixelSwap covers the page during theme changes and persists the choice. Reduced motion switches themes immediately.
- FloatingSurface adds pointer-driven lift, tilt, and glow to interactive navigation and cards. Fine-pointer checks keep touch layouts steady.
- Motion respects reduced-motion preferences. Use semantic links and buttons, visible focus rings, accessible names, and readable raw values alongside charts.

The gallery at `/design` demonstrates the current components. React Bits attribution and terms are in [LICENSE.react-bits.md](components/LICENSE.react-bits.md).
