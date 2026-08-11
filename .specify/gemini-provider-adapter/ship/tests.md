# Tests — Gemini Provider Adapter

## Derived verification map

- Provider host routing: unit tests prove ChatGPT and Gemini select separate adapters and
  unsupported hosts are rejected.
- Gemini discovery: unit tests prove only unique titled `/app/<id>` links are eligible; the home
  route is excluded.
- Destructive control guard: unit tests prove Gemini accepts delete only from a visible menu and
  visible confirmation dialog.
- Regression: the full Node suite retains ChatGPT, queue, route/tab safety, locale, and UI-style
  checks; package validation confirms files and host registration.
- Remaining gap: a logged-in manual test with a disposable Gemini chat must verify current DOM
  selectors, native confirmation, deletion result, route/tab pauses, and unchanged visual layout.
