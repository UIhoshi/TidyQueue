# Specification — Gemini Provider Adapter

## Approved behavior

TidyQueue must support regular visible Gemini conversations at `https://gemini.google.com/app`
through the exact existing TidyQueue UI and queue workflow. Gemini must be a provider adapter,
not a second UI or a fork of the queue controller.

## Functional requirements

1. The content script and extension popup recognize the Gemini host alongside the existing
   ChatGPT hosts.
2. A provider router chooses the ChatGPT adapter for ChatGPT and the Gemini adapter for Gemini;
   the control center continues to call one common `list()` / `deleteConversation()` interface.
3. The Gemini adapter discovers only unique sidebar links whose path is `/app/<conversation-id>`;
   it excludes the Gemini home route and unknown page objects.
4. Gemini deletion scopes its action discovery to the selected conversation's visible controls,
   then requires a visible Gemini delete menu action and visible native confirmation before
   proceeding.
5. If any Gemini control cannot be proven, the adapter throws; the existing queue pauses and
   does not start another deletion.
6. The existing UI source, localized messages, selection behavior, queue controller, and
   ChatGPT adapter behavior remain unchanged except for using the provider router.

## Verification requirements

- Unit tests cover Gemini link extraction, home-route exclusion, host-to-adapter routing, and
  fail-closed visible menu/confirmation selection.
- Existing tests, package validation, and manifest host/file checks pass.
- Manual logged-in Gemini validation remains required because the public page is login-gated and
  current provider DOM controls are mutable.
