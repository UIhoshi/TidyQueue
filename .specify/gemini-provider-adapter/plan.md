# Plan — Gemini Provider Adapter

## Architecture

Keep the TidyQueue UI and queue state machine provider-agnostic. Add a `GeminiAdapter` with the
same `list()` and `deleteConversation()` surface as `ConversationAdapter`, and a small
`createProviderAdapter()` router chosen from the current hostname. Load the router and Gemini
adapter before `content.js`, add the Gemini content-script match, and extend the popup's existing
host check. The adapter will use narrow `/app/<id>` sidebar links and visible menu/dialog checks;
it fails closed rather than guessing at Gems or other page objects.

## Red-Team Results

1. **Fails if Gemini's authenticated sidebar markup differs from the tested path.** Impact
   critical, likelihood high, cheapness medium. Mitigation: only accept `/app/<id>` links, scope
   actions to the selected row, fail closed on missing controls, and require logged-in manual
   verification before claiming deletion support verified.
2. **Fails if a generic visible menu/dialog belongs to another Gemini surface.** Impact critical,
   likelihood medium, cheapness medium. Mitigation: reveal and find the selected row's action
   control first; only then accept a visible delete action and native dialog confirmation.
3. **Fails if adding Gemini changes ChatGPT behavior.** Impact high, likelihood medium,
   cheapness high. Mitigation: retain the existing ChatGPT adapter unmodified and route by
   hostname; preserve all existing tests.
4. **Fails if an unknown Gemini object is listed as a deletable conversation.** Impact high,
   likelihood medium, cheapness high. Mitigation: require a non-empty `/app/<id>` path and no
   generic fallback links; unknown objects are excluded.
5. **Fails if the popup opens the UI on an unsupported Google page.** Impact medium, likelihood
   medium, cheapness high. Mitigation: allow only the exact Gemini app origin/path in the popup
   check and manifest content-script match.

## Validation

1. Add failing Node tests first for Gemini extraction, provider routing, and visible destructive
   controls.
2. Implement the adapter/router and narrow host registration.
3. Run `npm test`, `npm run package:check`, `git diff --check`, and inspect changed maps.
4. User manually reloads the unpacked extension and validates one disposable Gemini chat; this is
   the only path that can verify current authenticated DOM selectors and real deletion effects.
