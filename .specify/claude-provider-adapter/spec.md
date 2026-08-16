# Claude Provider Adapter Specification

## User scenarios
- On `claude.ai`, a user opens the unchanged TidyQueue control center, selects currently visible standard Claude chats, reviews the queue, and explicitly confirms deletion.
- The adapter reveals controls only for the selected chat, then accepts only a visible Delete action and a visible confirmation dialog.
- If Claude re-renders its sidebar briefly, the adapter retries boundedly. If it cannot verify a target/menu/confirmation, it throws so the existing queue pauses before another item is deleted.

## Boundaries
- List only Claude conversation anchors whose path contains a concrete `/chat/<id>` segment; do not collect projects, shared pages, settings, or remote API data.
- Do not change the TidyQueue selection, queue, confirmation, layout, or styling behavior.
- Existing status copy may be made provider-neutral so Claude failure/empty states do not incorrectly name ChatGPT; this is text-only accuracy, not a UI change.

## Verification
- Unit tests cover route parsing, unique titled chat extraction, visible destructive controls, provider routing, manifest scope/permissions, popup host recognition, and locale completeness.
- A logged-in Claude browser manual test remains required because DOM selectors are runtime-dependent.
