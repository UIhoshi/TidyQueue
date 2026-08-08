# Code Map

## Entrypoints
- `manifest.json` — MV3 registration, action popup, content-script order, ChatGPT host scope.
- `src/popup/popup.js` — validates the active tab then sends `quickdel:open`.
- `src/content/content.js` — creates the closed Shadow-DOM UI and draggable persistent launcher, owns ephemeral selection/density/theme state, responds to the popup, and refreshes its remembered route after each successful deletion so a ChatGPT navigation caused by deletion does not interrupt the queue.

## Key symbols
- `QueueController` in `src/content/queue-controller.js` — sequential lifecycle: `idle`, `running`, `paused`, `stopped`, `completed`; emits active/upcoming queue snapshots and applies the configured two-second inter-item safety delay.
- `ConversationAdapter` in `src/content/conversation-adapter.js` — `list()` extracts unique `/c/` links; `deleteConversation()` waits up to four seconds for a selected link to reappear after a transient ChatGPT sidebar refresh, reveals its controls, scopes menu and dialog actions to visible surfaces, and concurrently observes sidebar removal or final-confirmation closure, so a stale sidebar node does not serially delay the next item.
- `selectConversation()` in `src/content/content.js` — toggles selection and derives Shift ranges only from the current filtered cards. `render()` retains the conversation-grid scroll offset and focused input so selection does not jump to the top.
- `handleOutsidePointerDown()` in `src/content/content.js` — capture-phase check that dismisses an open Quickdel panel only when the pointer target is outside the Shadow-DOM host; it uses the same safe close path as the close control.
- `handlePointerDown()`, `handlePointerMove()`, and `handlePointerUp()` in `src/content/content.js` — move the launcher only during the current page session and suppress an accidental post-drag open.
- `resolvedTheme()` and `applyTheme()` in `src/content/content.js` — implement Auto, Dark, Light, and Violet Night themes; Auto follows system color-scheme changes.
- `findVisibleMenuAction()` and `findVisibleConfirmation()` — restrict destructive UI actions to visible menus/dialogs; unit-tested with fake DOM surfaces.
- `extractConversations()` and `inferRelativeAgeDays()` — pure extraction helpers covered by unit tests.
- `quickdelI18n.t()` in `src/content/i18n.js` — Chrome locale lookup with English fallback.

## Interfaces/events
- Popup → content-script message: `{ type: 'quickdel:open' }`.
- Lower-right `#qd-fab` → opens the same control center without taking action itself; it can be dragged without persisting its position.
- Content UI action data attributes route selection, density, review, confirmation, queue controls, and close actions.
- `ensureQueueModal()` creates one universal fixed-size queue panel. `showReview()` switches that persistent panel to review mode with 0/total progress, a scrollable removable deletion queue whose offset is retained when an item is removed, and explicit cancel/confirm controls; `showQueue(snapshot)` switches the same DOM tree back to live mode rather than replacing its dialog. `queueStateChanged(snapshot)` batches same-turn queue emissions into one animation-frame patch. `showQueue(snapshot)` then patches its SVG ring, progress values, controls, and three stable upcoming-row slots in place. The live and review modes share fixed CSS-grid rows for title/current-item/progress/notice/list/actions. The title, current-item line, and pacing notice each have a permanent layout footprint; pacing is displayed in the compact notice area rather than replacing the queue heading with a long status sentence. Populated changed rows use a Web Animations API opacity-only entrance without synchronous layout reads, movement, or live-modal reload.

## Localization
- `_locales/{en,zh_CN,es,fr,de,ja,ko,pt,it}/messages.json` — Chrome i18n catalogs.

## Validation
- Requirements brief validator — latest result: pass.
- `npm test` — seven Node unit tests; latest result: pass.
- `npm run package:check` — latest result: pass.
- Logged-in browser and visual validation remain pending.