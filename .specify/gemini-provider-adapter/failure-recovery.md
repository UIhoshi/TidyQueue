# Gemini Failure-Recovery Follow-up

## Scope

Correct two Gemini-only defects found during logged-in manual testing without changing the shared
TidyQueue workflow or visual layout outside the failure notice.

## Acceptance criteria

1. Before pausing for a missing Gemini action menu, the adapter retries a bounded lookup that
   re-finds the selected conversation row and re-triggers its hover controls.
2. The adapter chooses the nearest ancestor that actually contains a visible Gemini more-actions
   control, rather than stopping at an unrelated button container.
3. A queue failure message can show its complete actionable text in an accessible error callout
   without being clipped; normal queue layout remains unchanged.
4. Existing tests and package validation pass; the user manually rechecks Gemini deletion and the
   failure-notice visual state.
