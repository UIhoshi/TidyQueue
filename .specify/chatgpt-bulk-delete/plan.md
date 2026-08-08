# Technical Plan — ChatGPT Bulk Delete Extension

## Architecture
- Use a dependency-free Chrome Manifest V3 extension: action popup, static content script, CSS, and a narrowly scoped ChatGPT host match.
- The popup sends an `open` message to the active tab. The content script owns an ephemeral UI/controller state and injects a shadow-DOM control center.
- `ConversationAdapter` extracts likely sidebar conversation links and performs a guarded, selector-based delete sequence. It reports failure rather than retrying uncertain DOM actions.
- `QueueController` is a testable state machine. It runs sequentially, pauses every tenth successful item, supports pause/resume/stop, and is externally paused by URL guards only so temporary screen-capture focus changes do not interrupt the queue.
- Chrome `_locales` supplies nine language catalogs; an in-page fallback maps browser language to the catalog.

## Permissions
- `activeTab` and `scripting` for user-initiated activation; host access is restricted to ChatGPT origins. No storage, identity, network, history, or broad tab permission is requested.

## Red-Team Results
1. **Fails if ChatGPT changes its sidebar or delete-menu DOM.** Impact high, likelihood high, cheapness high. Mitigation: isolate selectors in `ConversationAdapter`, require explicit confirmation, pause on missing controls, and expose a clear error. Browser validation remains required.
2. **Fails if a queue action deletes the wrong conversation after navigation.** Impact critical, likelihood medium, cheapness medium. Mitigation: process one item at a time, compare active URL against the initial page, and keep delete-induced ChatGPT route changes from pausing the queue; the selected sidebar item remains the source of truth for the next guarded action.
3. **Fails if user loses track of a destructive queue.** Impact high, likelihood medium, cheapness low. Mitigation: review dialog, active/upcoming cards, progress count, pause and stop controls, milestone pauses.
4. **Fails if extension state persists sensitive titles.** Impact high, likelihood low, cheapness high. Mitigation: no Chrome storage API and no service/backend; clear state when the control center closes.
5. **Fails if accessible keyboard controls trap focus or overflow.** Impact medium, likelihood medium, cheapness medium. Mitigation: native buttons/checkboxes, dialog focus management, Escape handling, responsive max widths, and visual browser verification.

## Validation plan
- Static manifest/package validation.
- Node built-in unit tests for pure queue and adapter helpers.
- Manual logged-in Chrome test for the mutable ChatGPT DOM and visual behavior.
## Approved UI Revision Plan
- Add an always-available, collapsible lower-right Quickdel trigger. It only opens the local control center; it does not collect or act on conversation data by itself.
- Expand each conversation row/card to a keyboard-accessible selection target. Keep the native checkbox as an explicit state indicator. Use a selection anchor for Shift range selection over the current filtered order, and preserve selected membership for Ctrl/Meta-assisted selection.
- Keep visual/list modes in the same Shadow-DOM surface. Add a 1–4 column density control for compact list mode and capture Ctrl+wheel only inside that surface.
- Tighten list/card padding and grid gaps without reducing focus visibility or the readability of title/summary.

### Revision Red-Team Results
1. **Fails if Ctrl+wheel disables page zoom beyond Quickdel.** Mitigation: handle and prevent it only when the pointer event originates inside the open extension Shadow DOM.
2. **Fails if range selection includes hidden/filter-excluded conversations.** Mitigation: derive the range exclusively from `visibleItems()`.
3. **Fails if the floating trigger obscures ChatGPT controls.** Mitigation: use a compact lower-right button with fixed safe offsets, a collapse affordance, and no auto-open behavior.
4. **Fails if a full-card click conflicts with checkbox/keyboard interaction.** Mitigation: route checkbox clicks through the same selection function, expose `role=checkbox` and `aria-checked` on cards, and handle Enter/Space on the card itself.
## Theme and Floating-Trigger Revision Plan
- Remove the Ctrl+wheel event handler entirely; visible density buttons remain the only density control.
- Track pointer movement only on the Quickdel launcher. Treat a movement over a small threshold as dragging, suppress the following click, and retain coordinates only in the current content-script memory.
- Resolve the selected `auto` theme from `matchMedia('(prefers-color-scheme: dark)')`; subscribe to changes while Auto is active. Apply dark, light, or violet classes to the isolated Shadow-DOM shell and launcher.

### Revision Red-Team Results
1. **Fails if a drag opens the panel accidentally.** Mitigation: suppress the post-drag click after movement exceeds a threshold.
2. **Fails if the floating button becomes permanently inaccessible.** Mitigation: positions are only current-session state and reset to the safe default after page refresh.
3. **Fails if an automatic theme leaves unreadable controls.** Mitigation: use theme-specific color overrides for controls, cards, borders, dialogs, and launcher rather than changing only the page background.

## Approved safety pacing
- Add a two-second queue delay only between successful items; never delay the first item or completion.
- Keep pause/stop cancellation checks after the delay so no next action begins after user intervention.
- Surface the delay in the progress modal as a safety-pacing state. It is not described as a platform-safe rate or an enforcement bypass.


## Queue progress visualization
- Extend the existing queue modal with an accessible SVG ring driven by the `completed / total` snapshot.
- Transition the ring stroke between snapshots; expose the same state with ARIA progress values and retain the linear bar as a secondary reading cue.
- Preserve current item, next-three preview, pause, stop, and failure details.


## Stable queue-panel refinement
- Use fixed modal layout height and a flexible upcoming-list region.
- Render exactly three queue-row slots; invisible placeholders retain layout when fewer pending items remain.
- Apply enter-only row animation to actual next items, not to placeholders.


## Unified review and deletion panel
- Render review with the queue panel's fixed dimensions, zero-progress ring, completion bar, and a scrollable pending queue.
- Keep individual removal and cancel/confirm actions in the review variant.
- Mark live queue DOM separately so confirmation initializes the retained live-panel renderer without conflating review fields and live queue fields.
