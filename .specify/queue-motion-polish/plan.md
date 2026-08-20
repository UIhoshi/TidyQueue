# Plan — Deletion Queue Motion Polish

## Implementation
1. Keep the existing modal and three reusable live queue rows, but assign each a durable item identity and visual depth.
2. Detect only a true one-row queue advance. Rotate retained row nodes rather than replacing all text in place, animate the departing row upward, animate retained rows upward from their prior depth, and animate a new third row in from below.
3. Patch non-advance snapshots without fake movement, preserve placeholders for a short tail, and skip positional animation under `prefers-reduced-motion`.
4. Fix live-list containment and add regression tests for opacity depths, persistent slots, upward-only animation, and reduced-motion fallback.

## Red-Team Results
1. **Fails if a transition obscures which item will be deleted.** The row identity/order is changed only from the queue snapshot; opacity is visual-only, and each row keeps an explicit ordinal and title.
2. **Fails if an adapter failure or pause appears as success.** Only a forward overlap (`old[1..2] == new[0..1]`) animates. Other snapshots patch directly, preserving the paused/error state without a misleading upward motion.
3. **Fails if a visual change weakens destructive safety.** No QueueController, confirmation, provider, or safety-guard behavior is changed.
4. **Fails if motion recreates the reload effect or causes layout shift.** The modal/list/row slots retain DOM identity; fixed live-row geometry and a bounded ghost are used instead of modal/list replacement.
5. **Fails if motion harms accessibility or compact viewports.** Reduced motion skips animation; title containment and fixed-height list viewport prevent wrapping/reflow.

## Validation gap
A real logged-in Chrome deletion sequence is required to verify perceived smoothness and browser animation behavior. Unit/static checks cannot close that visual claim alone.