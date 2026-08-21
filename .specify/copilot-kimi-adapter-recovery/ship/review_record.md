# Shipping Review — Copilot and Kimi Adapter Recovery

## Intent versus implementation

The repair now follows the providers’ current public frontend contracts rather than guessing from
screenshots. Copilot conversations can be rendered as list-scoped role-link divs; the nested
`conversation-options-<id>` button supplies the stable ID, and its floating menu is marked with
`data-outside-events-ignore`. Kimi’s deletion flow uses a popover command followed by a native
confirmation surface that may be `.modal-mask` or have no semantic dialog root.

On an explicit Copilot TidyQueue open, the adapter now makes a bounded best-effort pass through
every detected scrollable history ancestor, brings the provider's history sentinel into view,
invokes only the provider-scoped visible **Show more** history control if rendered, and restores
all affected positions before the extension snapshots conversations. It does not select or delete
anything during loading.

## Flow and safety impact

- Copilot accepts route links only as a fallback; non-link rows require both the conversation-list
  scope and a real `conversation-options-<id>` control, excluding Library/Projects/navigation.
- Kimi waits for a visible deletion command in the selected row’s menu/popup, then for a distinct
  visible native confirmation button. The fallback excludes the selected provider-menu action and
  runs only after that row-local action was clicked. Its exact visible `删除` action is preferred
  over any enclosing menu container that merely contains the word.
- Copilot loading is limited to the nearest scrollable ancestor of its current sidebar history row,
  stops after bounded stable-bottom passes, and restores the user's previous position.
- Both retain the explicit TidyQueue review step, row-local action discovery, provider final
  confirmation, and pause-on-failure behavior. No permission or persistence change was made.

## Self-refute review

- **Claim:** Copilot will no longer produce an empty list for its current sidebar. **Evidence:** the
  current provider bundle renders `[role="list"] [role="link"]` rows with an inner
  `conversation-options-<id>` control; the adapter and regression directly implement that contract.
  **Residual gap:** a logged-in runtime must still confirm the deployed page matches the fetched
  current bundle.
- **Claim:** Copilot does not need a manual full sidebar scroll before TidyQueue opens. **Evidence:**
  `prepareList()` performs a bounded history-viewport scroll and restores the original position;
  unit coverage verifies viewport selection and restoration. **Residual gap:** a logged-in
  Copilot page must confirm that its lazy loader responds to programmatic scrolling.
- **Claim:** Kimi can see its native confirmation. **Evidence:** current Kimi source creates a
  `.modal-mask` confirmation after the menu deletion action; the adapter covers that root and the
  separately mounted visible-confirmation case while excluding the original menu action.
  **Residual gap:** browser replay remains required.
- **Claim:** the broadened selectors remain safe. **Counter-check:** Copilot requires a stable
  provider ID. Kimi's first action remains a visible selected-row popup action; its confirmation
  fallback is permitted only after that action and cannot reuse it. Browser replay remains needed
  to exclude provider-specific overlapping controls. The user-captured current Chinese menu is a `role="menu"`
  whose delete control is a semantic menuitem but the root is `visibility:hidden` when inspected. The
  adapter accepts that mounted command only when its title identifies the selected conversation, while
  visible paths retain exact-label-first matching and reject a parent wrapper containing multiple action labels.

## Validation

- `npm test` — 67 passing tests.
- `npm run package:check` — passed.
- Manual verification: the user confirmed the latest Kimi AI and Copilot ordinary-conversation deletion
  flows work after extension reload. The dedicated programmatic Copilot lazy-history materialization
  remains covered by unit tests; no separate user observation of its complete-sidebar boundary was recorded.
