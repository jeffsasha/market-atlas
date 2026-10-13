# PixelBlast

React Bits PixelBlast, from the complete JavaScript + CSS source supplied for this integration.

Upstream: https://reactbits.dev/backgrounds/pixel-blast

Repository: https://github.com/DavidHDev/react-bits

See `../LICENSE.react-bits.md` for the upstream license and attribution. The effect is inspired by https://github.com/zavalit/bayer-dithering-webgl-demo.

MarketAtlas adaptations:

- Dispose the latest animation frame, observers, pointer handlers, textures, and WebGL resources on unmount.
- Pause drawing when the page is hidden or the effect leaves the viewport.
- Size the postprocessing composer in CSS pixels to avoid applying device pixel ratio twice.
- Fall back to the hero's CSS dot pattern if WebGL initialization fails.
- Mark decorative canvas content as hidden from assistive technology.

`HomeHero.tsx` handles reduced motion and manual pause by unmounting the effect. The shader, circle pattern, liquid distortion, and ripple implementation are preserved from the supplied component.
