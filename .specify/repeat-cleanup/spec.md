# Repeat Cleanup Specification

## Scope
Fix the completed-queue workflow so a user can begin a new review-and-delete batch in the same open TidyQueue panel without refreshing the host tab or closing/reopening the extension.

## Acceptance criteria
1. After a queue reaches `completed`, the queue panel exposes an explicit, localized **Delete more** action and a separate Close action.
2. **Delete more** stops any completed queue guards, obtains a fresh conversation list from the active provider adapter, clears the previous batch selection and anchor, closes only the queue panel, and returns to the still-open control center.
3. A new selection continues through the existing review-and-explicit-confirmation step; no deletion starts from the refresh action.
4. The refresh path keeps all state in tab memory and remains fail-closed: adapter errors still pause the deletion queue as before.
5. All nine locale catalogs contain the new label, and regression coverage verifies batch-state reset behavior.

## Classification
Bounded destructive-workflow bug fix. This is a small UI correction, not a net-new or substantial UI refactor; a new mockup is not required. Final visible-state verification remains a logged-in Chrome manual step.
