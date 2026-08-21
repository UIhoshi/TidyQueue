# Plan — Copilot and Kimi Adapter Recovery

1. Use the current public provider bundles to match the actual contracts: Copilot list-scoped role
   links expose `conversation-options-<id>` and its floating menu has
   `data-outside-events-ignore`; Kimi uses an open popover followed by a native confirmation mount
   that may not carry a dialog role.
2. Add only those narrow selectors and tests. Keep Copilot route links as fallback, do not derive
   IDs from titles, and for Kimi consider a distinct visible deletion control only after the
   selected row's visible provider menu action was clicked; never use it to discover the first
   destructive action.
3. Re-run full validation and reload the unpacked extension for logged-in visual/browser proof.
4. On an explicit Copilot panel open only, use the detected scrollable history ancestor to
   best-effort materialize lazy rows, including the provider-scoped visible **Show more** history
   control when rendered, with bounded polling and restoration of the original scroll position
   before the extension reads its snapshot.

## Red-Team Results

1. **Fails if Copilot extracts arbitrary role links.** Require the provider’s nested
   `conversation-options-<id>` control and scope the selector beneath its conversation list.
2. **Fails if Kimi clicks a hidden or unrelated delete control.** Inspect only visible popup/menu
   candidates after opening the selected row action; confirmation must be distinct from that menu
   action and remain required before queue advance.
3. **Fails if auto-loading changes what the user sees or scrolls indefinitely.** Run it only for
   Copilot after explicit extension open, bound the steps and settling passes, and restore the
   original scroll position before presenting selectable conversations.
3. **Fails if provider DOM drifts again.** Preserve the current fail-closed pause instead of making
   a broad fallback action.
