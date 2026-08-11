# Specification — Selection Text Safety

## Scope

Prevent Shift-click range selection on conversation cards from starting the browser's native text
selection inside the TidyQueue Shadow DOM.

## Acceptance criteria

1. TidyQueue labels, cards, and controls cannot become a browser text-selection range during
   card selection.
2. The conversation search input remains selectable and editable.
3. Existing Shift range-selection behavior remains unchanged.
4. Automated tests and package validation pass; live Chrome visual verification remains manual.
