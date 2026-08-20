# Specification — Copilot, Perplexity, and Kimi Provider Adapters

## Intent
Extend the existing local-only destructive-review workflow to ordinary personal chat histories on Copilot, Perplexity, and Kimi. The current UI and all queue-safety behavior stay unchanged.

## Functional requirements
1. Register only the official provider hosts required for the three providers and route each host to a self-contained adapter.
2. Each adapter must list only unique, titled, ordinary conversation targets from links currently visible in the provider's own page DOM.
3. Each adapter must reject known non-conversation paths and never enumerate projects, spaces, shared pages, files, memories, settings, or workspace/team content.
4. Each deletion must re-find the chosen target, reveal controls only for that row, select Delete only from a visible provider menu, and confirm only in a visible dialog/alert dialog.
5. An unavailable target, action menu, Delete control, confirmation dialog, sidebar update, or closed confirmation must throw an error so the existing queue pauses/fails closed.
6. Preserve the current `activeTab` permission, current-tab-only in-memory state, current UI layout, and current ChatGPT/Gemini/Claude behavior. Existing supported-provider status text may become provider-neutral without a layout or interaction change.

## Verification requirements
- Unit-test routes, extraction filters, visible destructive-control guards, host routing, manifest/popup support, and package metadata.
- Run `npm test` and `npm run package:check`.
- Manually verify one disposable ordinary conversation deletion in a logged-in Chrome tab for each new provider after packaging. This manual evidence is not implied by static tests.
