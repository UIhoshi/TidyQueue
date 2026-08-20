# Requirements Brief — Copilot, Perplexity, and Kimi Provider Adapters

## Status
- Task classification: Multi-file behavior change / provider-adapter feature
- User approval: approved (scope, targets, and unchanged-UI constraint confirmed by user)
- Mockup decision: not applicable — the user explicitly requires reuse of the current UI without visual changes

## Goal and users
Enable a signed-in TidyQueue user to review and delete their own currently visible **ordinary** conversation-history entries on Microsoft Copilot, Perplexity, and Kimi using the existing TidyQueue UI and destructive-queue safeguards.

## Core flow
1. The existing popup and in-page launcher recognize a supported provider tab.
2. The existing control center lists only ordinary, currently visible conversation-history entries discovered by the provider-specific adapter.
3. The user selects entries, reviews the unchanged queue, and explicitly confirms deletion.
4. The existing queue runs one deletion at a time. Each adapter scopes interactions to the selected entry and only accepts a visible delete action and visible confirmation surface.
5. Missing/ambiguous provider controls, sidebar refresh failure, route changes, or tab loss pause/fail closed under the existing queue safety contract.

## Scope and non-goals
- In scope: `copilot.com`, `perplexity.ai`, and `kimi.com` ordinary personal conversation-history entries.
- In scope: provider-specific DOM adapters, provider routing, MV3 host registration, popup supported-host recognition, unit coverage, package validation, and project/code-map updates.
- Out of scope: projects, spaces, shared pages, favorites, workspaces, teams/enterprise content, files, memories, account settings, bulk account-history deletion, remote APIs, analytics, or persistent conversation metadata.
- Out of scope: any UI layout, theme, interaction, or visual redesign. The current TidyQueue UI remains the only interface; existing supported-provider status copy may be made provider-neutral only to keep it accurate without changing layout.

## Content, brand, and assets
- Reuse all existing TidyQueue UI and assets; keep the localized status surfaces provider-neutral so they remain accurate as adapters are added.
- Do not add provider branding or provider-specific visual surfaces.

## Integrations, data, and permissions
- DOM-only operation on a user-visible, signed-in tab; no provider APIs or network requests.
- Continue to keep discovered conversations, selections, and queues in current-tab memory only.
- Do not add Chrome permissions beyond the existing `activeTab` permission.
- Each provider adapter must be self-contained, bounded, and fail closed.

## Responsive, accessibility, and performance constraints
- No UI changes; existing responsive, keyboard, focus, and containment behavior must remain unchanged.
- Existing queue pacing, explicit confirmation, route-change pause, and hidden-tab pause behavior apply unchanged.
- Bounded polling/retry is allowed only for provider sidebar/action rendering; it must terminate with a safe failure.

## Acceptance criteria
- On each of Copilot, Perplexity, and Kimi, TidyQueue opens only from the supported website and lists only ordinary conversation-history targets currently present in the visible DOM.
- It never targets projects, spaces, shared pages, favorites, settings, files, memories, teams, or workspace content.
- A deletion starts only after the unchanged review-and-confirm step.
- For every provider, deletion actions are scoped to the selected entry and accepted only from visible provider controls; uncertainty pauses/fails closed before the next deletion.
- The current UI and existing ChatGPT/Gemini/Claude behavior are unchanged.
- `npm test` and `npm run package:check` pass.
- A logged-in Chrome manual test with a disposable ordinary conversation is recorded separately for each provider; until performed, the implementation is not browser-verified.

## Existing-layout change brief
- Current screenshot path (required only for dissatisfied existing layouts): not applicable
- User dissatisfaction and requested changes: no UI change requested; reuse the existing UI exactly.

## Decision log
- Decision: First-batch providers are Copilot, Perplexity, and Kimi.
  - Status: user-confirmed
  - Rationale: User approved the recommended first batch.
- Decision: Limit targets to ordinary personal conversation history.
  - Status: user-confirmed
  - Rationale: User excluded projects, spaces, shared pages, favorites, and workspace-like content because their deletion scope can include extra data or collaborators.
- Decision: Preserve the existing TidyQueue UI without visual changes.
  - Status: user-confirmed
  - Rationale: User explicitly requested the current general UI remain unchanged.
- Decision: Reuse existing local-only, explicit-confirmation, queue-safety, and fail-closed rules.
  - Status: recommended-and-accepted
  - Rationale: These are mandatory existing project constraints and allow provider expansion without weakening destructive-action safety.
- Decision: Browser validation is provider-specific and manual after implementation.
  - Status: recommended-and-accepted
  - Rationale: Provider DOMs are runtime-dependent; static and unit validation cannot establish live-page correctness.
