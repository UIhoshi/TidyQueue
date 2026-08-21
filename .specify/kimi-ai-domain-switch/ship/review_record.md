# Shipping Review — Kimi International Domain Switch

## Intent versus implementation

The approved scope replaces the China-focused Kimi hosts with the international Kimi AI hosts.
The extension now registers and opens only on `kimi.ai` and `www.kimi.ai`; `kimi.com` and
`www.kimi.com` are intentionally unsupported. The existing `KimiAdapter` retains its narrow
ordinary `/chat/<id>` discovery and visible-menu/visible-confirmation deletion guards.

## Architecture and flow impact

- The MV3 content-script scope, popup hostname predicate, and provider factory now agree on the
  two Kimi AI hosts.
- `kimi.com` routes through the existing unsupported-host branch before any adapter operation.
- The review-before-delete flow, local-only in-tab state, queue safety guard, and all other
  provider adapters are unchanged.

## Permission and trust review

- The manifest permission remains exactly `activeTab`; no debugger, storage, network, identity,
  or analytics capability was added.
- This is a host-scope replacement, not a broader Kimi permission grant: the two `.com` matches
  were removed as the two `.ai` matches were added.
- Kimi AI's live sidebar and confirmation DOM have not been observed in a logged-in browser;
  the adapter will fail closed if its narrow selectors do not match.

## Self-refute review

- **Claim:** only Kimi AI receives the Kimi content script. **Counter-check:** manifest, package
  validation, and provider regression require the `.ai` hosts and reject both `.com` hosts.
- **Claim:** the popup and adapter factory can open the supported Kimi AI tab. **Counter-check:**
  their shared host pair is unit-covered; a logged-in browser interaction remains required for a
  runtime claim.
- **Claim:** deletion remains guarded. **Counter-check:** the adapter's route filtering and
  visible-menu/dialog checks are unchanged and their unit coverage passes; live DOM compatibility
  is explicitly not claimed.

## Validation

- `npm test` — 50 passing tests.
- `npm run package:check` — passed.
- Active product surfaces contain no `kimi.com` registration or support claim. Negative test and
  package assertions intentionally retain the removed hostnames to prevent reintroduction.
- Manual follow-up: reload the unpacked extension and test one disposable ordinary conversation
  in a logged-in Kimi AI tab before advertising verified live deletion support.
