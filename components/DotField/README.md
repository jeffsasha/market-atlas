# DotField background adaptation

The supplied React Bits DotField reference is adapted into a CSS-only decorative dot field shared through `GlobalBackground` in the root layout. It uses theme tokens, evenly spaced small dots, and quiet ambient opacity changes.

There is no canvas, mouse tracking, pointer listener, cursor displacement, particle simulation, or animation frame loop. The layer has `pointer-events: none` and stays behind page content. Mobile and reduced-motion layouts use a static background. Desktop ambience runs once for four seconds; hidden pages pause it automatically. The footer contains only the owner’s GitHub profile link.

Upstream attribution and terms: [LICENSE.react-bits.md](../LICENSE.react-bits.md).
