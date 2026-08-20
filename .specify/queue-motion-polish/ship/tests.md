# Tests — Queue Motion Polish

## Automated
- `test/queue-motion-ui.test.js` asserts the 100%/75%/50% hierarchy, true one-row-overlap guard, upward departure/survivor/incoming hooks, fixed live viewport, and reduced-motion guard.
- `npm test` covers the full Node test suite.
- `npm run package:check` validates the MV3 package and required files.

## Manual gap
In a logged-in supported-provider Chrome tab, run a disposable batch with at least three items and observe two successive successful deletions. Confirm the panel remains present, order stays correct, opacity is 100%/75%/50%, no row list reload occurs, and reduced-motion behavior when available is non-animated.
