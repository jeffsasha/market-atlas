# GradientWaves

React Bits GradientWaves JSX and CSS supplied by the user, integrated with the existing attribution in `../LICENSE.react-bits.md`.

Uses `ogl` and requires WebGL2. The app validates context type and shader link success, caps DPR at 1.5 and rendering at 30 FPS, suspends while hidden/offscreen, and disposes geometry/program/context and observers/listeners. Pointer events are observed through foreground content. The homepage unmounts the effect when paused or reduced motion is preferred; CSS supplies a static gradient fallback.

Navigation is an original implementation of the requested dark-bar/white-mega-menu interaction, not a licensed Pro block.
