# Code Map

## Entrypoints
- `manifest.json` — MV3 registration, TidyQueue action popup/icon, content-script order, and supported ChatGPT/Gemini host scope.
- `src/popup/popup.js` — localizes popup copy through Chrome i18n, validates a supported active tab, then sends `quickdel:open`.
- `src/content/content.js` — creates the unchanged browser-locale-aware Shadow-DOM UI and draggable persistent launcher, owns ephemeral selection/density/theme state, selects the provider adapter, responds to the popup, and starts/stops the active queue's route and tab-visibility safety guard. It keeps a prominent localized warning directly above the results, explaining that ChatGPT and Gemini sidebars must be scrolled to the bottom before opening the extension so lazy-loaded conversations are discoverable. Its visual cards clamp long titles and summaries to two lines; list rows use a one-line title ellipsis to remain contained.

## Key symbols
- `QueueController` in `src/content/queue-controller.js` — sequential lifecycle: `idle`, `running`, `paused`, `stopped`, `completed`; emits active/upcoming queue snapshots and applies the configured two-second inter-item safety delay.
- `QueueSafetyGuard` in `src/content/queue-safety-guard.js` — while a queue is `running`, records its route, detects browser/SPA URL changes via events and polling, detects a hidden document, and pauses with `page-change` or `tab-hidden`; disposal removes its listeners and timer.
- `ConversationAdapter` in `src/content/conversation-adapter.js` — `list()` extracts unique `/c/` links; `deleteConversation()` waits up to four seconds for a selected link to reappear after a transient ChatGPT sidebar refresh, reveals its controls, scopes menu and dialog actions to visible surfaces, and concurrently observes sidebar removal or final-confirmation closure, so a stale sidebar node does not serially delay the next item.
- `GeminiAdapter` in `src/content/gemini-adapter.js` — mirrors the common list/delete contract only for `/app/<id>` Gemini sidebar conversations; it boundedly re-finds and hovers the selected row until the ancestor owning its visible more-actions control is available, then fails closed on missing visible menu or confirmation controls.
- `createProviderAdapter()` in `src/content/provider-adapter.js` — selects the ChatGPT or Gemini adapter by hostname and rejects unsupported pages before the unchanged UI can perform adapter operations.
- `selectConversation()` in `src/content/content.js` — toggles selection and derives Shift ranges only from the current filtered cards. The Shadow-DOM shell disables native text selection except in the search input, so Shift-click does not highlight plugin copy. `render()` retains the conversation-grid scroll offset and focused input so selection does not jump to the top.
- `handleOutsidePointerDown()` in `src/content/content.js` — capture-phase check that dismisses an open TidyQueue panel only when the pointer target is outside the Shadow-DOM host; it uses the same safe close path as the close control.
- `handlePointerDown()`, `handlePointerMove()`, and `handlePointerUp()` in `src/content/content.js` — move the launcher only during the current page session and suppress an accidental post-drag open.
- `resolvedTheme()` and `applyTheme()` in `src/content/content.js` — implement Auto, Dark, Light, and Violet Night themes; Auto follows system color-scheme changes.
- `findVisibleMenuAction()` and `findVisibleConfirmation()` — restrict destructive UI actions to visible menus/dialogs; unit-tested with fake DOM surfaces.
- `extractConversations()` and `inferRelativeAgeDays()` — pure extraction helpers covered by unit tests.
- `quickdelI18n.t()` in `src/content/i18n.js` — Chrome locale lookup with English fallback; it supports Chrome `$1`-style dynamic substitutions for accessible labels and progress text.

## Interfaces/events
- Popup → content-script message: `{ type: 'quickdel:open' }`.
- Lower-right `#qd-fab` → opens the same control center without taking action itself; it can be dragged without persisting its position.
- Content UI action data attributes route selection, density, review, confirmation, queue controls, and close actions.
- `ensureQueueModal()` creates one universal fixed-size queue panel. `showReview()` switches that persistent panel to review mode with 0/total progress, a scrollable removable deletion queue whose offset is retained when an item is removed, and explicit cancel/confirm controls; `showQueue(snapshot)` switches the same DOM tree back to live mode rather than replacing its dialog. `queueStateChanged(snapshot)` batches same-turn queue emissions into one animation-frame patch. `showQueue(snapshot)` then patches its SVG ring, progress values, controls, and three stable upcoming-row slots in place. The live and review modes share fixed CSS-grid rows for title/current-item/progress/notice/list/actions. On adapter failure only, the notice expands into an accessible two-line error callout so actionable text is not clipped; normal queue layout remains unchanged. Populated changed rows use a Web Animations API opacity-only entrance without synchronous layout reads, movement, or live-modal reload.

## Localization
- `_locales/{en,zh_CN,es,fr,de,ja,ko,pt,it}/messages.json` — complete Chrome i18n catalogs for every visible, error, popup, selection-guidance, and accessibility string; English is the manifest default while Chrome selects a matching browser locale.

## Validation
- Requirements brief validator — latest result: pass.
- `npm test` — twenty-nine Node unit tests, including Gemini provider routing, action-container retry selection, visible destructive-control guards, queue error-callout, card-text containment, and sidebar-load notice coverage, route/hidden-tab queue safety, locale completeness, and fallback substitutions; latest result: pass.
- `npm run package:check` — latest result: pass.
- Logged-in browser and visual validation remain pending.
