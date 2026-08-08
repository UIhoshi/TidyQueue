# Complete UI Localization

## Scope
- Deliver complete UI localization for the nine already configured Chrome locales: English, Simplified Chinese, Spanish, French, German, Japanese, Korean, Portuguese, and Italian.
- Localize the content-script controls, accessible labels, status/error messages, review/deletion flow, and extension popup.
- Preserve the current layout, controls, interaction flow, local-only privacy model, and destructive-action confirmation.

## Acceptance criteria
- Each locale catalog contains every user-visible and accessibility message used by the extension.
- The popup uses Chrome i18n rather than hard-coded English.
- Content-script controls use localized accessible labels, including dynamic conversation-selection text.
- Required substitutions render in both Chrome i18n and the local fallback path.
- No text or style change alters layout geometry.
- All tests and package validation pass; visual verification remains required after reloading the extension in each target locale.
