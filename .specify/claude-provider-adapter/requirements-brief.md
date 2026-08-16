# Requirements Brief

## Status
- Task classification: Feature — add a local-only Claude web adapter to the existing destructive cleanup flow.
- User approval: approved
- Mockup decision: not applicable — this change must preserve the existing interface, layout, and interaction flow; no net-new or substantially refactored UI is requested.

## Goal and users
Allow a signed-in TidyQueue user to review and delete their own visible Claude web conversations from `claude.ai`, using the same safeguards already provided for ChatGPT and Gemini.

## Core flow
1. The extension activates only on a supported `claude.ai` page.
2. It reads currently visible Claude sidebar conversations only.
3. The existing selection, review, explicit confirmation, sequential deletion, pacing, and pause-on-failure/page-change/tab-loss flow remains unchanged.
4. The Claude adapter scopes actions to the selected conversation’s visible controls and fails closed if a menu, delete action, or confirmation dialog cannot be verified.

## Scope and non-goals
- In scope: `claude.ai` desktop web sidebar conversations, through the existing local-only extension flow.
- Non-goals: Claude API use, mobile support, account/data import, history synchronization, analytics, remote services, persistence of selection metadata, and visual/UI redesign.
- Existing ChatGPT and Gemini adapter behavior and the existing UI layout/interaction contract must remain unchanged.

## Content, brand, and assets
- Reuse existing extension icon, visual layout, and local Chrome i18n system.
- Add only the minimum localized copy needed to identify Claude as a supported host where existing support-status text would otherwise be inaccurate.
- Do not use Claude/Anthropic assets, logos, or brand styling.

## Integrations, data, and permissions
- Add only the `https://claude.ai/*` content-script match; retain the existing `activeTab` permission and no host permissions, network permissions, backend, or storage.
- Use standard browser DOM APIs in an isolated Claude adapter. No API calls or external services.
- Provider DOM discovery/deletion remains a fail-closed adapter boundary and requires a logged-in browser manual verification.

## Responsive, accessibility, and performance constraints
- Keep existing native controls, focus styles, Shadow-DOM boundaries, localized labels, and responsive layout unchanged.
- The adapter must use bounded retries only for transient Claude sidebar rendering and must not continue after an uncertain destructive action.
- No visual/layout redesign or mockup is needed because the interface contract is unchanged.

## Acceptance criteria
1. `claude.ai` selects a `ClaudeAdapter`; unsupported hosts remain rejected.
2. Claude sidebar extraction returns only unique, visible, titled Claude conversation routes and never uses remote data.
3. A selected Claude conversation can be deleted only after the existing review and explicit confirmation, with adapter action lookup constrained to visible menu/dialog surfaces.
4. Missing or changed Claude controls pause the queue before another item is deleted.
5. ChatGPT and Gemini provider routing, permissions, and existing UI behavior stay covered by regression tests.
6. All locale catalogs remain complete, and package validation accepts the new adapter and host match.
7. The completed queue can continue with a fresh batch without reloading, unchanged from the preceding bug fix.

## Existing-layout change brief
- Current screenshot path (required only for dissatisfied existing layouts): Not applicable — no layout change requested.
- User dissatisfaction and requested changes: No visual/UI changes; add Claude support only.

## Decision log
- Decision: Support surface is limited to `claude.ai` web conversations visible in the sidebar.
  - Status: user-confirmed
  - Rationale: User explicitly confirmed the web-only scope.
- Decision: Reuse the existing review/confirmation and fail-closed queue lifecycle.
  - Status: user-confirmed
  - Rationale: User requested no functional/UI changes outside adding Claude deletion support.
- Decision: Keep the interface/layout unchanged; only minimum existing-copy accuracy updates are permitted.
  - Status: user-confirmed
  - Rationale: User explicitly said not to change functionality or UI.
- Decision: Manual logged-in Claude verification is required after implementation.
  - Status: recommended-and-accepted
  - Rationale: Provider DOM changes cannot be proven by static tests.
