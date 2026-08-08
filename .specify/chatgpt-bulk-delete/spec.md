# Specification — ChatGPT Bulk Delete Extension

## Product behavior
Quickdel is a desktop Chrome Manifest V3 extension for a user’s visible ChatGPT web tab. It discovers sidebar conversation links, allows unlimited in-memory selection, and injects a local control center with compact-list and visual-card modes that share selection state.

## Requirements
1. The extension shall activate only after the user clicks its action on `chatgpt.com` or `chat.openai.com`.
2. The in-tab control center shall support text filtering, selectable conversation cards, bulk selection/clear selection, compact/visual mode switching, and a review dialog listing pending items.
3. No deletion attempt shall occur until the user explicitly confirms the review dialog.
4. The deletion queue shall show one active item and up to three upcoming items, offer Pause/Resume and Stop & keep remaining, pause at every ten completed items, and pause on per-item failure.
5. The queue shall pause if the page becomes hidden or its URL changes during processing.
6. Conversation metadata, selections, and queue state shall not be persisted after tab refresh or close and shall never be sent to a remote service.
7. The primary surface shall use browser-language strings with English fallback and ship Simplified Chinese, English, Spanish, French, German, Japanese, Korean, Portuguese, and Italian catalogs.
8. Primary controls and dialogs shall be keyboard-operable.

## Acceptance verification
- Build/package checks pass without external dependencies.
- Unit tests prove queue pause/stop/milestone transitions and sidebar-link extraction.
- A logged-in browser validation is required to confirm current ChatGPT selector compatibility, deletion flow, and visual containment.