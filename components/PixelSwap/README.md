# PixelSwap theme transition

Based on the React Bits PixelSwap JSX and CSS supplied for this integration. `ThemeToggle` uses the component for its icon and full-page decorative wipe.

The `revealUnderlay` extension reverses the opaque covering tiles to expose the existing page. It never clones application content or interactive controls. The pixel count is capped at 220, animations are disposed on cleanup, and reduced motion bypasses the page wipe.
