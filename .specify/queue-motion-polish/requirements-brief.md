# Requirements Brief — Deletion Queue Motion Polish

## Status
- Task classification: Substantial UI behavior refinement of the existing deletion queue
- User approval: approved — the user specified the queue hierarchy, upward motion, and no-reload goal, then explicitly requested a UI mockup from the supplied screenshots
- Mockup decision: requested

## Goal and users
Help a user understand the next deletion order at a glance and make a running destructive queue feel continuous rather than rebuilt after every successful deletion.

## Core flow
1. The existing review-and-confirm safety gate remains unchanged.
2. During a live deletion, retain the persistent queue modal and its three fixed upcoming rows.
3. The first upcoming row is fully opaque, the next row is 75% opaque, and the third is 50% opaque.
4. When an item completes, rows shift upward as one smooth sequence and the incoming third item enters from below; do not replace/reload the modal or list tree.

## Scope and non-goals
- In scope: live queue row hierarchy, transition timing, persistent DOM patching, and supporting regression tests.
- Out of scope: changes to the review/confirmation requirement, queue pacing, provider adapters, queue ordering, deletion behavior, or the overall TidyQueue visual system.

## Content, brand, and assets
- Input images: user-supplied deletion queue screenshots, used as visual references only.
- Reuse the existing dark/violet TidyQueue visual system and live queue layout.
- No provider branding or new product assets.

## Integrations, data, and permissions
- No new integration, persistence, permission, or network behavior.
- Existing in-memory queue snapshots remain the sole state source.

## Responsive, accessibility, and performance constraints
- Preserve fixed modal height and live-region semantics.
- Respect `prefers-reduced-motion`; state changes must remain understandable without motion.
- Avoid synchronous layout reads and avoid rebuilding the queue panel/list when a row advances.

## Acceptance criteria
- The three live upcoming rows visibly use 100%, 75%, and 50% opacity in top-to-bottom order.
- A completed deletion produces one coherent upward transition: first row exits upward, remaining rows move upward, and a new row enters from below.
- The live modal and its queue list retain their DOM identity across item advances.
- Existing queue safety, review/confirmation, and controls remain unchanged.
- `npm test` and `npm run package:check` pass; live Chrome visual verification is performed separately.

## Existing-layout change brief
- Current screenshot path: `C:\Users\XU RONG\.codex\attachments\b04041ed-7c1e-482f-8e39-4c02ec31542a\image-1.png` and `image-2.png`
- User dissatisfaction and requested changes: the current deletion surface visibly reloads after every deletion. The user wants a 100% / 75% / 50% top-to-bottom opacity hierarchy and a smoother bottom-to-top queue scroll.

## Decision log
- Decision: Use 100%, 75%, and 50% opacity for the three upcoming rows from top to bottom.
  - Status: user-confirmed
  - Rationale: It communicates deletion order without altering the queue ordering.
- Decision: Advance rows from bottom to top in one coherent animation rather than fading/reloading each independently.
  - Status: user-confirmed
  - Rationale: The requested result is a smoother sense of continuity after each deletion.
- Decision: Keep the current UI system and destructive safety flow.
  - Status: user-confirmed
  - Rationale: The requested change targets the live queue motion only.
- Decision: Preserve a non-animated readable state when reduced motion is preferred.
  - Status: recommended-and-accepted
  - Rationale: Motion conveys order but cannot be the only way to understand state.

## Validator
- `scripts/validate-requirements-brief.ps1` is not present in this repository. The brief follows the installed first-party template and is recorded before mockup generation.