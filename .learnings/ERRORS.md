# Project Error Log

## 2026-08-21 — Claude's native final deletion confirmation rejected extension-generated input
- Symptom: TidyQueue could locate Claude's visible menu and native final Delete control but could not complete the final confirmation with content-script-generated events.
- Root cause: Claude requires trusted user input for its final destructive confirmation; ordinary content-script pointer, click, and keyboard events are not trusted user input.
- Correction: The user chose to remove Claude support rather than grant the broad Chrome `debugger` permission. Claude's host match, adapter, popup recognition, tests, and support claims were removed; the other five providers remain unchanged.
- Prevention: Do not add a high-sensitivity browser permission merely to bypass a provider's native destructive-confirmation boundary. Verify whether an automation path can generate trusted input before advertising batch support.
- Verification: Provider-routing regression rejects `claude.ai`, manifest/package checks require no Claude adapter or host match and no `debugger` permission; full test and package validation are required.

## 2026-08-16 — A completed cleanup could not reliably begin a fresh batch in the same panel
- Symptom: After a completed deletion batch, a later newly selected batch could not reliably begin unless the user refreshed the page or closed/reopened TidyQueue.
- Root cause: The completed queue kept its old in-memory sidebar snapshot and selection lifecycle on the persistent queue panel, with no explicit in-panel transition that refreshed the adapter data for a new batch.
- Correction: Added a completed-only localized **Delete more** action. It invalidates stale queued renders, stops the completed guard, refreshes the current provider snapshot, clears the old selection/anchor, and returns to the still-open selection surface. The normal review-and-confirmation gate remains mandatory.
- Prevention: Any reusable destructive queue must explicitly reset its completed batch state and reacquire current adapter data before exposing a new batch.
- Verification: Regression coverage proves repeated completed batches of different sizes hand off without retaining old IDs; `npm test` (35 tests) and `npm run package:check` pass. Logged-in Chrome verification remains required.

## 2026-08-12 — Sidebar lazy-loading could hide conversations without warning
- Symptom: ChatGPT and Gemini could show only a partial conversation list when their left sidebar had not been scrolled to the bottom before opening TidyQueue, with no prominent explanation in the extension.
- Root cause: Both hosts lazily materialize sidebar rows, while the extension correctly reads only the current DOM and did not surface that limitation.
- Correction: Added a persistent, high-contrast localized notice immediately above the results, instructing the user to scroll the host sidebar to its bottom before opening TidyQueue.
- Prevention: When host-visible data may be lazily loaded, present the prerequisite where the user evaluates the result set, not as low-priority helper copy.
- Verification: Notice regression coverage, 30 Node tests, and package validation pass; manual ChatGPT/Gemini visual retest remains required.

## 2026-08-12 — Long conversation text overflowed cards
- Symptom: Long conversation titles or summaries could extend beyond visual cards; the same risk existed in compact list rows.
- Root cause: Card text had no width containment or line-clamp/truncation rule.
- Correction: Contained card overflow, clamped visual titles and summaries to two lines, and made list titles truncate with an ellipsis.
- Prevention: Conversation-card UI must bound user-provided text separately for visual and compact-list densities.
- Verification: Card-containment regression coverage, 29 Node tests, and package validation pass; logged-in Visual and List retest remains required.

## 2026-08-12 — Gemini queue required Resume between deletions
- Symptom: A Gemini queue could delete one conversation, then pause with a missing action-menu error; pressing Resume could delete only the next item before the same failure recurred.
- Root cause: Gemini renders its row-level more-actions control asynchronously after hover or sidebar refresh, while the first adapter version performed a one-time lookup and could stop at an ancestor containing an unrelated button.
- Correction: Retry a bounded selected-row lookup with hover events and choose the nearest ancestor that actually owns a visible Gemini more-actions control. The failure notice now expands into a readable error callout instead of clipping its text.
- Prevention: For reactive provider sidebars, destructive controls must use bounded re-discovery and tests must distinguish an action-owning container from any button container.
- Verification: Regression tests, full Node test suite, and package validation pass; user manually confirmed Gemini and ChatGPT deletion success on 2026-08-12.

## 2026-08-12 — Shift range selection highlighted plugin text
- Symptom: After selecting an anchor card, Shift-clicking another card selected the expected range but also triggered native browser text highlighting across TidyQueue copy.
- Root cause: The isolated UI did not disable browser text selection for non-editable interface content.
- Correction: Made the Shadow-DOM shell nonselectable while explicitly preserving text selection in the conversation search input.
- Prevention: Pointer-driven selectable controls should suppress incidental native text selection without disabling editable fields.
- Verification: Regression assertion, full Node test suite, and package validation pass; Chrome visual confirmation remains required.

## 2026-08-12 — Active queue did not pause on route or tab changes
- Symptom: A deletion queue had page-change and tab-hidden UI messages but no listener or route comparison could trigger them.
- Root cause: The earlier deletion-navigation workaround wrote an unused remembered URL and removed the runtime route guard, leaving neither URL nor visibility monitoring in the active queue lifecycle.
- Correction: Added a disposable `QueueSafetyGuard` that watches navigation events, SPA URL changes, and document visibility only while the queue is running; it pauses with the existing safety reasons before another queued item can begin.
- Prevention: Pair every declared destructive-queue safety state with a tested runtime trigger and lifecycle cleanup path.
- Verification: Nineteen Node tests and `npm run package:check` pass; logged-in browser validation remains required.

## 2026-08-08 — JSON packaging validator rejected UTF-8 BOM
- Symptom: `npm run package:check` failed parsing `manifest.json` with `Unexpected token '\uFEFF'`.
- Root cause: PowerShell file output created UTF-8 files with a byte-order mark, which the initial Node JSON reader did not normalize.
- Correction: Rewrote JSON files as UTF-8 without BOM and hardened the package validator to strip a leading BOM when reading JSON.
- Prevention: Keep generated extension JSON UTF-8/BOM-free; package validation now covers every locale catalog and the manifest.
- Verification: `npm test` and `npm run package:check` passed after the correction.

## 2026-08-08 — Deletion queue treated a valid deletion as a failure
- Symptom: The queue could pause immediately after a deletion attempt even when ChatGPT was still processing the sidebar update or had navigated away from an active deleted conversation.
- Root cause: The adapter used unscoped page-wide action lookup, waited only 450 ms for sidebar removal, and classified an expected post-delete URL change as an error.
- Correction: Scope menu lookup to visible open menus and confirmation dialogs, reveal actions only on the selected sidebar item, and observe sidebar removal without treating a successful post-delete navigation as an adapter failure. When ChatGPT retains a stale mounted history link, use the closed final confirmation as a bounded fallback success signal rather than falsely pausing the queue.
- Prevention: Keep mutable ChatGPT DOM logic scoped and state-observed; do not infer success/failure from a fixed delay or URL alone.
- Verification: Nine unit tests and package validation pass; logged-in browser verification is still required.

## 2026-08-08 — Selecting a lower conversation reset the in-panel scroll position
- Symptom: Selecting a card near the bottom of the card or list view jumped the conversation pane back to its top.
- Root cause: Selection rerendered the entire Shadow-DOM layer; the new scroll container started at zero and the search input used `autofocus` on every redraw.
- Correction: Preserve the conversation-pane `scrollTop`, remove repeated `autofocus`, and restore a previously focused input without scrolling.
- Prevention: State-only redraws must preserve local viewport and focus state.
- Verification: Static syntax, nine unit tests, and package validation pass; browser visual verification remains pending.

## 2026-08-08 — Transient UI focus and sidebar refresh interrupted a deletion queue
- Symptom: Taking a screen capture or clicking outside during a queue could interrupt deletion, and the following item could briefly be reported missing even though Resume later succeeded.
- Root cause: The control center treated a temporary visibility change as a mandatory pause, outside-click dismissal could reach the queue close path, and the adapter failed immediately while ChatGPT was rebuilding its sidebar after the prior deletion.
- Correction: Do not dismiss an active queue through the outside-click handler; remove visibility-only queue pauses; wait up to four seconds for the selected sidebar link to return before reporting a failed item. Also reserve the queue action area and remove list margins so pending rows cannot overlap controls.
- Prevention: Treat temporary capture/focus changes and reactive sidebar redraws as transient state, but retain page-navigation and bounded failure guards for destructive actions.
- Verification: Static syntax checks, ten Node unit tests, and package validation passed; logged-in browser validation remains required.

## 2026-08-08 — Queue progress appeared to jump between deletion states
- Symptom: The deletion panel visibly jumped when a queue moved between current item, pacing, and next item, even though its DOM tree was retained.
- Root cause: QueueController emitted several logically intermediate snapshots in one event turn; the renderer patched each immediately, hid/shown the notice (changing vertical layout), replaced the heading with a long pacing sentence, and forced reflow to restart every row animation.
- Correction: Batch same-turn snapshots into one animation frame, keep title/current-item/notice slots at fixed dimensions, reserve notice space with visibility rather than display changes, make pacing a compact notice, and start row animation on the next animation frame without synchronous layout reads.
- Prevention: A persistent DOM tree alone is insufficient for visual continuity; batch bursty state sources and preserve every changing region's layout footprint.
- Verification: Static syntax checks, ten Node unit tests, and package validation passed; live Chrome visual verification remains required.

## 2026-08-08 — Review confirmation still visually reloaded the queue panel
- Symptom: Even with a fixed live queue DOM, moving from review to deletion could feel like the deletion panel reloaded.
- Root cause: Review used a separate modal tree, and the first live queue snapshot replaced `#qd-modal` wholesale before updating state.
- Correction: Build one universal queue-panel DOM tree and switch its review/live mode, action visibility, progress fields, and list content in place. Removing an item from review now updates that same panel rather than redrawing the full control center.
- Prevention: When two workflow phases are meant to feel continuous, share the actual DOM identity—not merely equivalent markup and dimensions.
- Verification: Syntax checks, ten Node unit tests, and package validation passed; browser visual continuity remains to be confirmed after reloading the content script.

## 2026-08-08 — ChatGPT deletion navigation repeatedly paused the queue
- Symptom: After the first active conversation was deleted, ChatGPT changed its route and the queue paused. Resume could work once, but the stale original URL made the periodic route guard pause it again; the panel could also look blank while class/rAF row animation restarted.
- Root cause: The route guard could not distinguish a user navigation from ChatGPT’s expected post-delete navigation, and the row animation deferred a class mutation to a later frame.
- Correction: Remove the URL-based queue pause for this SPA workflow and refresh the remembered route after each successful guarded deletion. Use a direct opacity-only Web Animations API animation for changed upcoming rows, avoiding deferred class/layout mutation.
- Prevention: Treat platform-generated navigation as part of the operation when the destructive action is scoped to a selected stable item ID; do not layer route guards that will invalidate a successful queue.
- Verification: Static syntax checks, ten Node unit tests, and package validation passed; targeted logged-in ChatGPT verification remains required.
## 2026-08-22 — Kimi support targeted the wrong regional host
- Symptom: The extension registered `kimi.com`, but the requested international Kimi experience is at `kimi.ai`.
- Root cause: The earlier provider integration did not confirm the intended regional Kimi host before
  registering manifest and popup scopes.
- Correction: Replaced all active Kimi host registrations, popup recognition, adapter routing, route
  fixtures, and public host disclosures with `kimi.ai`/`www.kimi.ai`; `kimi.com` is now rejected.
- Prevention: For provider integrations with regional domains, confirm the exact user-targeted host
  before implementing and assert both the allowed and excluded host sets in package validation.
- Verification: Provider/unit and package regressions cover the Kimi AI hosts and the removed Kimi
  China hosts; logged-in Kimi AI DOM verification remains required.
## 2026-08-22 — Provider sidebar/menu semantics drifted from adapter assumptions
- Symptom: Copilot initially showed visible sidebar conversations while TidyQueue found none. Once
  the visible Copilot sidebar was scrolled fully, scanning worked, but deletion paused because the
  open floating menu could not be located. Kimi AI listed conversations and found the visible
  Chinese `删除` command, then paused while finding its native confirmation.
- Root cause: Copilot now renders many sidebar conversations as `[role="link"]` divs instead of
  anchors; each row’s nested `conversation-options-<id>` control carries its stable ID, while the
  deletion menu is mounted at `data-outside-events-ignore` and may remain `visibility:hidden` when the
  extension sees it, even though its selected-conversation delete command is mounted. Kimi uses a provider popover for the
  first command and may mount its native confirmation without a semantic dialog root.
- Correction: Copilot discovers only its list-scoped role-link rows with a real
  `conversation-options-<id>` control, retaining route-link support as a fallback, detects the
  provider floating-menu root, accepts its mounted hidden delete command only when that command's title
  includes the selected conversation title, and on an explicit extension open best-effort scrolls its detected
  history ancestors, brings the provider sentinel into view, or invokes only its scoped visible
  **Show more** control before restoring prior user positions and snapshotting. Kimi requires a
  exact visible selected-row `删除` command rather than a text-containing menu container, then
  finds a distinct visible native confirmation control while excluding the first action from reuse.
- Prevention: For provider adapters, inspect the current public bundle and use stable provider
  identifiers or scoped container contracts. If a user explicitly asks to avoid manual sidebar
  scrolling, restrict any programmatic materialization to the detected provider history viewport,
  bound it, restore the original position, and never advance a destructive queue if any required
  control is missing.
- Verification: 67 Node tests and package validation pass. The supplied DOM verifies the current Copilot
  menu root is `visibility:hidden` and the delete menuitem title binds it to the selected conversation.
  The user confirmed both Kimi AI and Copilot deletion work after the latest extension reload.
