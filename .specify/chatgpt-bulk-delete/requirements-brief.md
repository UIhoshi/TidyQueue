# Requirements Brief

## Status
- Task classification: New Chrome extension / major feature / substantial UI
- User approval: approved
- Mockup decision: revision approved

## Goal and users
- Goal: Let ChatGPT web users safely select and delete many conversation threads through a clear, visual, locally executed workflow.
- Primary users: Desktop Chrome users who need to clean up their own ChatGPT conversation history without handling one conversation at a time.

## Core flow
1. The user opens ChatGPT in a visible desktop Chrome tab and activates the extension.
2. The user filters and selects conversations with no selection-count limit.
3. The user switches between a compact sidebar-selection mode and a visual card mode; both modes preserve the same selection state.
4. Before deletion, a confirmation window shows the pending conversation list, total count, and active filters. The user can remove or skip individual items.
5. After confirmation, deletion runs in the visible ChatGPT tab. Progress has transition animation and exposes Pause plus Stop-and-keep-remaining actions.
6. The progress surface displays four cards: one currently deleting and the next three queued for deletion. At every 10 completed items, it pauses briefly while showing the milestone progress.
7. A per-item failure automatically pauses the queue and marks the failure for user review. Leaving the tab or detecting page-state change also pauses the queue.

## Scope and non-goals
### In scope
- Chrome desktop extension targeting ChatGPT web initially.
- Bulk selection, filters, manual confirmation, compact and visual modes, animated queue progress, pause/stop, and failure handling.
- Conversation-card title and first-message summary, where locally available from the current page.
- Interface localization: Simplified Chinese plus English, Spanish, French, German, Japanese, Korean, Portuguese, and Italian. Default language follows the browser language.
- Keyboard operation and focus management for primary actions.

### Non-goals for v1
- Mobile support, other websites, an extension account, a backend service, cloud synchronization, or reading account-profile information.
- Persisting pending deletion lists, selected conversation metadata, or operation history after refresh, tab close, or browser restart.
- A reduced-motion preference mode; the visual progress animation remains enabled.

## Content, brand, and assets
- Visual direction: restrained dark translucent floating layer, generous cards, and soft progress animation, harmonized with ChatGPT without imitating its brand assets.
- Visual mode uses titles and first-message summaries rather than refreshed latest-message summaries.
- No external brand, user-content upload, or remote asset dependency is planned.
- Mockup artifact: .specify/mockups/chatgpt-bulk-delete-visual-mode.png (baseline, user-approved)
- Revision mockup: `.specify/mockups/chatgpt-bulk-delete-density-revision.png` (generated; user-approved).

## Integrations, data, and permissions
- Runs locally in the user's existing ChatGPT browser session; no separate sign-in and no account-information collection.
- Any conversation metadata used for selection or preview remains in the active browser page/extension process and is not sent to a server.
- Deletion must run only in an open, user-visible ChatGPT tab. It pauses if the tab is left or the page state changes.
- Exact Chrome permissions and current ChatGPT UI integration details remain to be validated during technical planning.

## Responsive, accessibility, and performance constraints
- Desktop Chrome only for v1.
- Keyboard-accessible controls and predictable focus behavior for confirmation, pause, continue, stop, and skip/remove actions.
- Selection count is unlimited. Execution is paced with a short milestone pause every 10 items.
- Deletion UI must maintain clear progress and queue state without obscuring the ability to stop or pause.

## Acceptance criteria
- A user can select any number of conversations in either mode, change modes without losing selection, and inspect/remove individual pending items before deletion.
- No deletion begins without an explicit confirmation in the pending-list window.
- During deletion, the user can see completed/remaining progress, one active card, and three upcoming cards; can pause or stop; and sees a brief transition at each 10-item milestone.
- Failed deletion, navigating away from the active target page, or changing the page state pauses the queue rather than silently continuing.
- No account-profile information, cloud service, or persistent deletion list is used.
- The UI defaults to the browser language when it is one of the nine supported languages, with a defined fallback for unsupported languages.
- Primary controls are keyboard-operable.

## Existing-layout change brief
- Current screenshot path: `.specify/mockups/chatgpt-bulk-delete-visual-mode.png` (approved design baseline; browser capture remains pending).
- User dissatisfaction and requested changes: The selectable target is too small; the list feels too vertically loose; card whitespace is excessive; the extension has no visible in-page installed-state cue.
- Revision requirements: Clicking anywhere on a conversation card toggles selection while its checkbox remains available as an accessible state control. Ctrl-click adds/removes one item without clearing prior selection; Shift-click selects the contiguous visible range from the selection anchor. List and card views are a same-surface mode switch. The compact mode supports an explicit 1–4 column density picker; browser Ctrl+wheel remains untouched. A compact Quickdel floating button sits in a user-dragged position in the current ChatGPT tab and opens the control center. The theme picker offers Auto (system-following), Dark, Light, and Violet Night.

## Decision log
- Decision: Use time-range filtering plus manual selection confirmation as the core selection workflow.
  - Status: user-confirmed
  - Rationale: Retains efficiency while reducing accidental deletion.
- Decision: Show a confirmation window with the pending list, count, and filters; allow individual skip/remove.
  - Status: user-confirmed
  - Rationale: Gives users a final, low-friction safety check.
- Decision: Support only desktop Chrome ChatGPT web in v1.
  - Status: user-confirmed
  - Rationale: Keeps the first integration stable; other sites and mobile are future work.
- Decision: Use no account system or backend; keep processing local.
  - Status: user-confirmed
  - Rationale: Minimizes privacy risk and implementation complexity.
- Decision: Provide compact and visual modes that share selection/filter/deletion state.
  - Status: user-confirmed
  - Rationale: Supports both high-density and spacious workflows without losing selection.
- Decision: Visual cards show title and first-message summary, not refreshed latest summaries.
  - Status: user-confirmed
  - Rationale: Avoids refresh-dependent previews.
- Decision: Allow unlimited selection, process in paced groups with a pause at each 10-item milestone.
  - Status: user-confirmed
  - Rationale: Gives visible progress while avoiding overly rapid sequences.
- Decision: Provide Pause and Stop-and-keep-remaining controls. Display one active and three upcoming cards.
  - Status: user-confirmed
  - Rationale: Makes the destructive queue understandable and controllable.
- Decision: Pause automatically on individual failure, tab leave, or target-page state change.
  - Status: user-confirmed
  - Rationale: Prefer safe interruption over a potentially incorrect continuation.
- Decision: Use a restrained dark translucent visual style with soft progress animation.
  - Status: user-confirmed
  - Rationale: Avoids the overly dense extension patterns the user dislikes.
- Decision: Keep animation enabled; support keyboard interaction.
  - Status: user-confirmed
  - Rationale: Visual feedback is a requested product trait, while keyboard access improves operation.
- Decision: Support Simplified Chinese, English, Spanish, French, German, Japanese, Korean, Portuguese, and Italian; default to browser language.
  - Status: user-confirmed
  - Rationale: Provides broad initial language coverage without an account or cloud dependency.
- Decision: Do not persist pending lists; the user reselects after refresh or restart.
  - Status: user-confirmed
  - Rationale: Limits local retention of conversation metadata.




## Revision Decision Log
- Decision: A full card is the selectable target; checkbox remains for state visibility and keyboard/accessibility.
  - Status: user-confirmed
  - Rationale: Expands the selection hit target without losing an explicit control.
- Decision: Ctrl-click changes individual membership; Shift-click selects a continuous visible range from the selection anchor.
  - Status: user-confirmed
  - Rationale: Matches desktop bulk-selection expectations.
- Decision: Keep list and visual cards in one control center, rather than separate windows.
  - Status: user-confirmed
  - Rationale: Preserves filters and selection state while changing density.
- Decision: Support compact-grid density from one to four columns; Ctrl+wheel over the extension surface adjusts density only there.
  - Status: user-confirmed
  - Rationale: Makes large conversation sets scannable without hijacking page zoom.
- Decision: Add a lower-right collapsible Quickdel floating trigger in each eligible ChatGPT page.
  - Status: user-confirmed
  - Rationale: Makes the installed extension discoverable without requiring repeated popups.
## Theme and Floating-Trigger Decision Log
- Decision: Remove the panel Ctrl+wheel density gesture; use only the visible 1–4 density picker.
  - Status: user-confirmed
  - Rationale: Browser zoom must remain predictable.
- Decision: Make the Quickdel floating launcher draggable in the current page session; do not persist its position after refresh.
  - Status: user-confirmed
  - Rationale: Lets users avoid page controls without retaining local metadata or preferences.
- Decision: Offer Auto, Dark, Light, and Violet Night themes; Auto follows the operating-system color-scheme preference.
  - Status: user-confirmed
  - Rationale: Supports day/night use while retaining an optional distinctive visual theme.

## Safety pacing decision
- Decision: Wait approximately two seconds after each successful deletion before beginning the next selected conversation.
  - Status: user-confirmed
  - Rationale: Keeps visible, sequential destructive actions deliberate. This is a local safety pacing control, not a guarantee about platform enforcement or a way to bypass service restrictions.


## Queue progress visualization decision
- Decision: Show an animated circular completion ring for every deletion queue. The ring center displays completed and total counts (for example, `7 / 20`), while the surrounding progress UI retains the active item and next three pending conversations.
  - Status: user-confirmed
  - Rationale: Makes long destructive queues legible at a glance without removing the existing detailed next-item preview.


## Stable queue-panel decision
- Decision: Keep the deletion-progress modal at a stable size throughout a run. Reserve three upcoming-item slots even near completion; actual upcoming rows animate into those slots without resizing the panel.
  - Status: user-confirmed
  - Rationale: Prevents visual jumps while preserving awareness of what is about to be deleted.


## Unified review and deletion panel decision
- Decision: The pre-deletion review uses the same fixed-size queue-progress visual system as live deletion: completion ring, secondary bar, queue region, and stable controls. Review retains individual remove controls and final confirmation.
  - Status: user-confirmed
  - Rationale: Makes confirmation flow into execution without an abrupt visual-context switch.
