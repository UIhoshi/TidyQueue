# Project Error Log

## 2026-08-12 — Gemini queue required Resume between deletions
- Symptom: A Gemini queue could delete one conversation, then pause with a missing action-menu error; pressing Resume could delete only the next item before the same failure recurred.
- Root cause: Gemini renders its row-level more-actions control asynchronously after hover or sidebar refresh, while the first adapter version performed a one-time lookup and could stop at an ancestor containing an unrelated button.
- Correction: Retry a bounded selected-row lookup with hover events and choose the nearest ancestor that actually owns a visible Gemini more-actions control. The failure notice now expands into a readable error callout instead of clipping its text.
- Prevention: For reactive provider sidebars, destructive controls must use bounded re-discovery and tests must distinguish an action-owning container from any button container.
- Verification: Regression tests, full Node test suite, and package validation pass; logged-in Gemini retest remains required.

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
