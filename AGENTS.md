# TidyQueue — Local Project Rules

- Product: a Chrome Manifest V3 extension that helps a user review and delete their own ChatGPT, Gemini, or Claude conversations from a visible tab.
- Privacy: do not add analytics, remote services, account collection, or persistence of selected conversation metadata.
- Safety: deletion is destructive. It must require an explicit review/confirmation and pause on adapter failure, page changes, or tab loss.
- Validation: run `npm test` and `npm run package:check` before completion. Browser verification against a logged-in supported-provider session remains a separate manual step.
- Session entry: before planning or editing, read `.learnings/ERRORS.md` and apply its prevention guidance; do not repeat questions already resolved in the active task unless new evidence creates a material conflict.
- Keep `PROJECT_MAP.md` and `CODE_MAP.md` aligned with structural or key-flow changes.
