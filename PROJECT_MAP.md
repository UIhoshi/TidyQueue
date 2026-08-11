# Project Map

## L1 — Entry & Surface
- `manifest.json`: Chrome MV3 registration, TidyQueue extension/action icon, content-script registration for ChatGPT and Gemini, and only `activeTab` permission.
- `src/popup/`: browser-locale-aware extension-action launch surface that sends an open message only to an active supported ChatGPT or Gemini tab.
- `src/content/content.js`: browser-locale-aware Shadow-DOM control center plus an always-visible, current-session-draggable TidyQueue launcher in eligible supported tabs. A capture-phase outside-pointer handler dismisses the panel when the user clicks the underlying page.
- `PRIVACY_POLICY.md`: public, English privacy-policy surface for the Chrome Web Store submission and repository readers.
- `README.md` and `docs/images/`: public repository overview and four product screenshots covering the launcher, visual selection, list view, and deletion review.

## L2 — Flow & Lifecycle
- `provider-adapter.js` routes the unchanged UI and queue contract to `ConversationAdapter` on ChatGPT or `GeminiAdapter` on `gemini.google.com`.
- `ConversationAdapter.list()` discovers unique ChatGPT sidebar `/c/<id>` links and heuristically classifies date-group headings for time filters; `GeminiAdapter.list()` discovers only unique Gemini `/app/<id>` sidebar conversations.
- `content.js` holds selection, selection anchor, list density, floating-launcher position, theme selection, and queue state only in memory. It preserves the in-panel conversation scroll offset and focused input through local redraws. Outside-page clicks close only an idle panel; they do not interrupt a running or paused deletion queue.
- Cards toggle individual membership; Shift selects the contiguous filtered range from the anchor. Ctrl/Meta membership changes preserve the existing selection. Shadow-DOM UI text is nonselectable to prevent browser text highlighting during card range selection, while the search field remains editable.
- `QueueController` runs one deletion at a time, inserts a visible two-second local safety delay between successful items, pauses at each 10-item milestone, and supports user pause/resume/stop. The queue modal animates an accessible completed/total circular ring and secondary bar while retaining the active item and next three. It reserves three fixed upcoming slots and a stable modal height, so queue updates do not resize the dialog. Queue emissions in one event turn are batched into one animation frame, and the persistent live modal uses a fixed CSS grid for title/current-item/progress/notice/list/actions; these regions keep a permanent footprint rather than rebuilding or reflowing the dialog. Its height is clamped to the visible shell space even at compact viewport widths or browser zoom. The pre-delete review and live deletion share one persistent queue-panel DOM tree: confirmation switches its mode, action visibility, and list content in place rather than replacing the modal. Both use the same fixed grid, zero-progress/current-progress visual, and scrollable queue region.
- `QueueSafetyGuard` records the active route while deletion is running, watches browser navigation events plus short SPA-safe URL polling, and pauses on either a route change or a hidden tab. Its timer and listeners stop whenever the queue pauses, stops, completes, or the panel closes. A transient sidebar rebuild is retried for up to four seconds before an adapter failure fails closed.

## L3 — Control & Verification
- Deletion cannot begin before the injected review dialog's explicit confirmation.
- A running queue pauses before another deletion when the ChatGPT route changes or the tab becomes hidden.
- Each provider adapter reveals and limits DOM actions to the selected sidebar item, finds delete only in a visible open menu and confirmation only in a visible dialog, then observes sidebar removal and final-confirmation closure concurrently; either successful signal advances the queue, so a stale mounted history link does not impose a fixed per-item delay.
- Grid density is changed exclusively by the visible 1–4 controls; TidyQueue does not intercept Ctrl+wheel, so browser zoom remains unchanged.
- `npm test` uses Node's test runner for queue transitions, route/hidden-tab safety guards, ChatGPT/Gemini provider routing and link helpers, locale-catalog completeness, and fallback substitutions.
- `npm run package:check` validates the MV3 manifest, required source files, ChatGPT/Gemini host matches, and the complete UI message set for all nine browser locales.

## L4 — Base & Dependencies
- Chrome Manifest V3, browser DOM APIs, Shadow DOM, Chrome i18n with English default and browser-locale matching, Node built-in test runner.
- No runtime dependencies, backend, analytics, Chrome storage, identity, history, or network permission. Themes use `prefers-color-scheme` only in the active page.

## Unconfirmed Points
- [ ] Verify ChatGPT's current delete menu/confirmation selectors in a logged-in Chrome session.
- [ ] Verify Gemini's current delete menu/confirmation selectors in a logged-in Chrome session with a disposable conversation.
- [ ] Verify visible layout, overflow, focus order, floating-launcher placement, grid density, and keyboard flow in Chrome.
- [ ] Verify localized copy and text containment after reloading the extension in the nine supported browser locales.
