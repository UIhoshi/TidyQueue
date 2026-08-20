# Architecture — Queue Motion Polish

## Scope
The persistent Shadow-DOM deletion panel now keeps the same three live queue rows through a successful queue advance. `src/content/content.js` detects a one-row overlap in the existing upcoming snapshot, rotates the reusable row nodes, and uses bounded Web Animations API transforms for the departing, retained, and incoming rows.

## Boundaries
- No provider adapter, stored data, analytics, remote service, permission, or `QueueController` lifecycle changed.
- Live rows are presentation of the controller's existing ordered snapshot only.
- Non-advancing snapshots (pause, adapter failure, stop, or initial render) patch without movement.

## Known verification gap
A logged-in Chrome session is still required to visually confirm the animation across two successful deletions.
