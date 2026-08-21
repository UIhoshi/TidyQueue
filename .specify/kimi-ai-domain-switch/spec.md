# Specification — Kimi International Domain Switch

## User decision

TidyQueue must support the international Kimi website at `kimi.ai` (including `www.kimi.ai`).
The China-focused `kimi.com` hosts are out of scope and must no longer receive the extension.

## Required behavior

- The Manifest V3 content script loads on `https://kimi.ai/*` and `https://www.kimi.ai/*`, not
  on `kimi.com` or `www.kimi.com`.
- The action popup recognizes the same two Kimi AI hosts and rejects the removed Kimi hosts.
- The provider factory maps only the Kimi AI hostnames to the existing fail-closed `KimiAdapter`.
- Kimi route helpers must remain origin-agnostic while accepting only titled ordinary `/chat/<id>`
  history links and excluding project paths.
- Package validation and regression tests must protect the host-scope decision.
- Public privacy/support documentation and project maps must describe Kimi AI accurately.
- The existing review/confirmation gate, local-memory privacy model, queue safety controls, and
  `activeTab`-only permission model remain unchanged.

## Verification

- Unit tests prove `kimi.ai` and `www.kimi.ai` route to `KimiAdapter`, while `kimi.com` and
  `www.kimi.com` are unsupported.
- Unit tests exercise ordinary Kimi AI `/chat/<id>` links and reject project/non-conversation paths.
- `npm test` and `npm run package:check` pass.
- A future manual test in a logged-in Kimi AI tab must verify one disposable ordinary-conversation
  deletion before claiming live DOM compatibility.
