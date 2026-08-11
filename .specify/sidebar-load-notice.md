# Sidebar Loading Notice

## Scope
Make the existing host-side lazy-loading prerequisite obvious without changing provider discovery, selection, or deletion behavior.

## Acceptance
- A persistent, prominent localized notice appears directly above the conversation results.
- It tells users to scroll the ChatGPT or Gemini conversation sidebar to the bottom before opening TidyQueue.
- The notice remains readable in every supported theme and browser locale.

## Validation
Run notice and locale regression tests, `npm test`, and `npm run package:check`; manually inspect the notice in a logged-in ChatGPT and Gemini tab.
