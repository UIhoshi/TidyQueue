# Complete UI Localization Plan

## Implementation
1. Treat the existing nine locale folders as the requested language set; complete their partial translations rather than adding redundant locales.
2. Add shared message keys for all currently hard-coded popup and content-script labels.
3. Make the popup read its static and runtime text through `chrome.i18n`.
4. Replace content-script hard-coded user-facing and ARIA strings with localized messages, including one dynamic title substitution.
5. Extend locale/package tests to require the complete key set and verify the fallback substitution contract.

## Red-Team Results

| Risk | Fails if… | Mitigation |
| --- | --- | --- |
| Missing key | one locale falls back to English or displays a key name. | Package validation checks every required key in every locale. |
| Broken placeholder | a dynamic label or pacing message shows `$1` literally. | Support both Chrome `$1` and local fallback substitutions; unit-test it. |
| Layout regression | translated labels create new structural styling changes. | Do not alter CSS or layout declarations; retain normal wrapping/overflow behavior. |
| Safety regression | confirmation or paused/error copy becomes ambiguous. | Preserve the existing confirmation and stop/pause semantics in every translation. |
