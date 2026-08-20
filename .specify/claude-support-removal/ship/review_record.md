# Shipping Review — Claude Support Removal

## Intent versus implementation

The approved intent is to remove Claude from TidyQueue rather than add the broad `debugger`
permission needed for trusted final-confirmation input. The implementation removes the Claude
content-script host match, adapter source, provider-router branch, popup recognition, dedicated
tests, obsolete adapter specification, and public support/privacy statements.

## Architecture and flow impact

- Supported-provider routing is now ChatGPT, Gemini, Copilot, Perplexity, and Kimi only.
- A Claude tab is rejected by the existing unsupported-host branch before the control center can
  run.
- The selection/review/confirmation queue, local-only state, and all remaining adapters are
  unchanged.

## Permission and trust review

- Manifest permission remains exactly `activeTab`.
- No `debugger`, background worker, network, storage, identity, cookie, or analytics capability
  was added.
- Removing `https://claude.ai/*` narrows the extension's host exposure.

## Self-refute review

- **Claim:** the removed provider cannot still receive the content script. **Counter-check:**
  manifest and package validation assert the host match and adapter script are absent.
- **Claim:** an action popup cannot open TidyQueue on that provider. **Counter-check:** popup
  recognition was removed and provider-router regression verifies the hostname is unsupported.
- **Claim:** remaining providers retain support. **Counter-check:** routing regression retains all
  five remaining provider families, and the complete Node test suite passes.

## Validation

- `npm test` — 50 passing tests.
- `npm run package:check` — passed.
- Runtime/public-surface audit found no removed-provider support reference. Negative package and
  regression assertions intentionally retain the former hostname only to prevent reintroduction.
