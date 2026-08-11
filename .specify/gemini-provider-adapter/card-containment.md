# Card Text Containment Follow-up

## Scope
Constrain unusually long conversation titles and summaries in the existing Shadow-DOM cards without changing selection, provider, or deletion behavior.

## Acceptance
- Visual cards show at most two title lines and two summary lines.
- List cards show a one-line ellipsized title and keep summaries hidden.
- Card contents remain inside their rounded parent boundaries.
- Full titles remain available through the existing accessible selection label.

## Validation
Run the card-containment regression test, `npm test`, and `npm run package:check`; perform manual Visual and List checks in a logged-in supported tab.
