# Specification — Deletion Queue Motion Polish

## Behavior
- Live queue rows represent the next three ordinary deletion targets and keep their existing order.
- Their visual priority is top-to-bottom 100%, 75%, and 50% opacity.
- When the queue advances, the departing first row exits upward, retained rows advance upward by one slot, and the replacement row enters from below as a single bounded transition.
- The modal, list, and three reusable row elements remain present; only their values, order, and transient motion state change.

## Safety and accessibility
- The review confirmation, queue controls, adapter-failure pause, route/tab safety guard, and deletion ordering do not change.
- Reduced-motion users receive the correct new ordered rows without positional animation.
- Long titles remain contained in the fixed live queue viewport.

## Verification
- Static UI regression coverage checks persistent list/slots, hierarchy classes, upward motion hooks, and reduced-motion guard.
- Existing tests and package validation pass.
- Chrome visual verification checks the real live queue after multiple deletions.