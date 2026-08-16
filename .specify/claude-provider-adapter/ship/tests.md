# Tests — Claude Provider Adapter

- Route parsing/extraction: unit tests allow only unique titled standard Claude `/chat/<id>` links and reject project/share/non-chat routes.
- Destructive control guard: tests require a visible menu for Delete and a visible dialog for final confirmation.
- Provider registration: tests verify Claude routing, `claude.ai` match, popup recognition, script order, and unchanged `activeTab` permission.
- Regression: the full Node suite retains ChatGPT, Gemini, queue safety, locale, and UI-style coverage.
- Remaining gap: a logged-in Chrome test with a disposable Claude chat must verify current sidebar/menu/dialog selectors and visible layout.
