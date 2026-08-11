# Specification — Active Queue Safety Guards

## Scope

Repair the active deletion queue so it stops before processing another conversation when the
user changes the ChatGPT route or the tab becomes hidden. This is a safety correction to the
existing confirmed-deletion flow; it does not alter selection, review, or deletion selectors.

## Acceptance criteria

1. When an active queue detects that the page URL differs from its recorded route, it pauses
   with the `page-change` reason and processes no further item.
2. When an active queue detects that the document becomes hidden, it pauses with the
   `tab-hidden` reason and processes no further item.
3. Route checks cover both browser navigation events and ChatGPT single-page-app history changes.
4. Safety monitoring is active only while a queue is running and its timer/listeners are cleaned
   up after pause, stop, completion, or panel closure.
5. Regression tests prove the route-change and hidden-tab behavior; existing queue tests and
   package validation remain green.

## Out of scope

- Automatic resume after a page or tab change.
- Persistent storage of queue or route data.
- Changes to ChatGPT DOM selectors or the explicit review confirmation.
