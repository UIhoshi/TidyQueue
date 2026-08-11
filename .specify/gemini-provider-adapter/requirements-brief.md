# Requirements Brief — Gemini Provider Adapter

## Status
- Task classification: multi-file behavior feature; destructive-operation provider adapter.
- User approval: approved.
- Mockup decision: explicitly opted out — the existing UI must not change.

## Goal and users

Enable a user who is already using the unchanged TidyQueue extension on Gemini to review and
delete their own visible Gemini conversations with the same local-only, review-first workflow
already provided for ChatGPT. The same adapter architecture should make future provider additions,
such as Claude, incremental rather than UI redesigns.

## Core flow

1. On `https://gemini.google.com/app`, the existing popup and in-page launcher open the unchanged
   TidyQueue control center.
2. The provider adapter discovers only regular, visible Gemini sidebar conversations.
3. Existing filtering, card/list selection, Shift range selection, review queue, and explicit
   TidyQueue confirmation work unchanged.
4. The adapter deletes one selected Gemini conversation only by its own visible menu and native
   confirmation dialog.
5. The existing queue remains sequential, paced, and pausable; it pauses on adapter failure,
   route changes, and a hidden/lost tab before another item can start.

## Scope and non-goals

- In scope: normal Gemini chat conversations available from the visible sidebar at
  `https://gemini.google.com/app`.
- In scope: preserving the current UI, copy, locales, local-only state model, and deletion review.
- Out of scope: any visual/UI change; Gemini Gems or non-conversation objects; pinned/special
  objects whose type cannot be confidently identified; bulk actions outside the existing queue;
  Claude or other providers in this delivery.
- Out of scope: any regression or behavioral change to ChatGPT support.

## Content, brand, and assets

- Reuse the current TidyQueue UI and localized strings without additions or visual changes.
- Do not add Gemini brand assets, remote content, analytics, or tracking.

## Integrations, data, and permissions

- Add only the Gemini host match required for its content script and the existing popup eligibility
  check; retain the existing minimal permission model.
- Add a provider-specific DOM adapter behind the existing adapter boundary. It must fail closed if
  Gemini's current menu or confirmation controls cannot be identified.
- Conversation titles, selection state, and queue state remain in the current page memory only;
  no storage, account, network, or telemetry capability is added.

## Responsive, accessibility, and performance constraints

- Do not alter existing visual layout, keyboard flow, focus behavior, or localized UI.
- Keep discovery and deletion bounded to visible Gemini surfaces and one queue item at a time.
- Preserve the existing route/tab safety behavior and user-controlled pause/stop controls.

## Acceptance criteria

1. TidyQueue opens only on supported ChatGPT and Gemini hosts; unsupported tabs continue to show
   the existing unsupported-tab behavior.
2. Gemini's adapter returns only unique, visible regular conversations and never guesses at an
   unsupported object type.
3. Gemini deletion requires both TidyQueue review confirmation and Gemini's native visible delete
   confirmation, then observes a bounded success signal; missing controls pause the queue.
4. All existing ChatGPT tests continue to pass; new unit tests cover Gemini host routing and
   adapter success/failure guards.
5. `npm test` and `npm run package:check` pass.
6. A logged-in manual check on a disposable Gemini conversation verifies list/select/review/delete,
   route/tab pause behavior, and unchanged UI containment.

## Existing-layout change brief
- Current screenshot path (required only for dissatisfied existing layouts): not applicable — no UI change.
- User dissatisfaction and requested changes: preserve all existing functionality and appearance;
  only add Gemini compatibility.

## Decision log
- Decision: Support only `https://gemini.google.com/app` regular visible conversations in this delivery.
  - Status: user-confirmed.
  - Rationale: User requested Gemini first, with future providers added one by one.
- Decision: Keep all existing UI and existing ChatGPT behavior unchanged.
  - Status: user-confirmed.
  - Rationale: Gemini must use the same functional workflow rather than a provider-specific redesign.
- Decision: Use a provider-adapter boundary for Gemini and future sites.
  - Status: recommended-and-accepted.
  - Rationale: It keeps shared UI/queue safety behavior stable while isolating mutable provider DOM logic.
- Decision: Require a disposable logged-in Gemini browser check before declaring provider deletion verified.
  - Status: recommended-and-accepted.
  - Rationale: Mutable authenticated DOM selectors and native confirmation dialogs cannot be proven by unit tests.
