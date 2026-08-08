# Requirements Brief

## Status
- Task classification: Substantial UI theme and readability refinement
- User approval: approved
- Mockup decision: explicitly opted out

## Goal and users
- Goal: Make TidyQueue's existing desktop control-center UI easy to read and visually coherent in every supported theme without changing its layout or destructive-deletion safeguards.
- Primary users: Desktop Chrome users reviewing and deleting their own ChatGPT conversations.

## Core flow
1. A user opens the existing TidyQueue panel and selects a theme.
2. The user reads filters, selection counts, conversation cards, and the fixed review-deletion action without low-contrast ambiguity.
3. The existing selection, review, confirmation, and deletion flows remain unchanged.

## Scope and non-goals
### In scope
- Refine the four existing themes: Auto, Dark, Light, and Violet Night.
- Improve typography hierarchy, color contrast, borders, buttons, selected states, and disabled states.
- Preserve the current system sans-serif font family and all existing layout, content, controls, flows, and localization.

### Non-goals
- No layout, density, spacing-structure, interaction, permission, deletion-safety, or data-handling changes.
- No new fonts, external assets, analytics, remote services, or persisted selection metadata.

## Content, brand, and assets
- Visual direction: a calm, deep-indigo safety-tool identity with restrained violet accents; primary actions remain immediately recognizable and destructive/safety states remain unambiguous.
- Existing-layout reference: user-provided TidyQueue screenshot from 2026-08-08 shows weak contrast in theme controls and secondary text.
- No external brand assets or remote resources.

## Integrations, data, and permissions
- Existing local-only, visible-tab Chrome extension behavior remains unchanged.
- No new permissions, data collection, storage, network access, or integrations.

## Responsive, accessibility, and performance constraints
- Desktop Chrome remains the target.
- Preserve keyboard focus visibility and semantic controls.
- Meet WCAG AA contrast: at least 4.5:1 for normal text and interactive text; at least 3:1 for large text and non-text control boundaries where applicable.
- Avoid layout changes and new runtime/font-loading costs.

## Acceptance criteria
- Each of Auto, Dark, Light, and Violet Night has an internally consistent palette and legible typography.
- Primary, secondary, selected, focused, and disabled states remain visibly distinct without relying on color alone.
- Normal and interactive text meets the stated WCAG AA contrast target.
- The existing panel layout, density behavior, queue/review safety flow, and local-only privacy model do not change.
- The result is visually verified in a logged-in ChatGPT tab after the content script reloads.

## Existing-layout change brief
- Current screenshot path (required only for dissatisfied existing layouts): User-provided conversation screenshot, 2026-08-08.
- User dissatisfaction and requested changes: Current theme colors and type contrast do not fit together; several labels and controls are too faint to read confidently. Keep the layout unchanged while optimizing the rest of the visual system.

## Decision log
- Decision: Do not change the layout.
  - Status: user-confirmed
  - Rationale: The user requested a visual-system refinement only.
- Decision: Retain the deep-indigo safety-tool direction and use restrained violet accents.
  - Status: recommended-and-accepted
  - Rationale: It keeps TidyQueue's identity while avoiding widespread low-contrast purple treatment.
- Decision: Retain and optimize Auto, Dark, Light, and Violet Night.
  - Status: user-confirmed
  - Rationale: The existing visible theme choices must be coherent in every mode.
- Decision: Retain the system sans-serif font family; refine only hierarchy, weight, size, and color.
  - Status: user-confirmed
  - Rationale: It protects layout stability and avoids loading new assets.
- Decision: Use WCAG AA as the minimum contrast target.
  - Status: user-confirmed
  - Rationale: The reported issue is inadequate visibility.
- Decision: Skip a new UI mockup for this refinement.
  - Status: user-confirmed
  - Rationale: The user explicitly requested direct implementation.
