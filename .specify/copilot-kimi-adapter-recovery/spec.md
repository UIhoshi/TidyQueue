# Specification — Copilot and Kimi Adapter Recovery

## Observed failures

- A signed-in Copilot page visibly showed ordinary conversation titles while TidyQueue found none.
  The current Copilot bundle renders those rows as `[role="list"] [role="link"]` divs and gives
  each one a nested `conversation-options-<id>` control, rather than always rendering an anchor.
- On Kimi AI, TidyQueue selected conversations and found the visible `删除` item in its opened
  popover, then paused because the provider’s native confirmation can use `.modal-mask` or no
  semantic dialog root.

## Required behavior

- Copilot must discover only ordinary list-scoped role-link rows carrying a real
  `conversation-options-<id>` control, while retaining concrete ordinary route links as fallback.
  Library, Projects, group/shared chats, and temporary chat remain excluded.
- When the user explicitly opens TidyQueue on Copilot, the adapter must best-effort scroll only
  Copilot's detected history viewport until its height is stable at the bottom, bring its history
  sentinel into view, and invoke only a provider-scoped visible **Show more** history control when
  present; then restore every affected sidebar/page scroll position before taking the review
  snapshot. This loading step must not select, delete, or otherwise mutate conversations.
- Kimi AI must recognize the visible `删除` command in its opened selected-row popover and a
  distinct native confirmation control, including `.modal-mask` and the provider's non-semantic
  confirmation mount. When the menu container itself contains that text, the exact visible
  `删除` item must win so a container without a delete handler is never activated.
- Both adapters keep their existing fail-closed behavior: only a user-selected ordinary
  conversation may be targeted; a missing menu or confirmation pauses the queue; final deletion
  remains behind TidyQueue review and the provider confirmation.
- No UI, permission, persistence, or host-scope change is in scope.

## Verification

- Focused unit coverage reproduces Copilot’s role-link/id, floating-menu, and lazy-history-load
  contract and Kimi’s popover/native-confirmation paths.
- `npm test` and `npm run package:check` pass.
- The supplied screenshots are visual evidence of the pre-fix faults. Logged-in browser retests
  are required before asserting final live compatibility.
