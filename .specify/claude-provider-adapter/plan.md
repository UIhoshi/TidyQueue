# Claude Provider Adapter Plan

## Implementation
1. Add a self-contained `ClaudeAdapter` with pure route/list helpers and bounded DOM action discovery, loaded before the existing provider router.
2. Route only `claude.ai` to that adapter and register the same host as an MV3 content-script match; do not add permissions.
3. Extend the popup supported-host predicate. Make only existing provider-specific status copy neutral where Claude can reach it.
4. Add focused unit tests, then update package validation, project/code maps, and error records.

## Red-Team Results
1. **Fails if non-chat Claude links become destructive targets.** The extractor accepts only concrete paths with a `/chat/<id>` segment, requires a non-empty visible title, and deduplicates IDs.
2. **Fails if an unrelated visible menu or dialog is clicked.** The adapter reads delete controls only from visible menu roots and confirmation controls only from visible dialogs; missing proof throws and pauses the queue.
3. **Fails if the provider changes its DOM.** Selected-row lookup and menu/confirmation discovery are bounded; uncertain state fails closed. A logged-in manual check is mandatory.
4. **Fails if Claude support expands extension privileges or alters current providers.** Tests enforce `activeTab` only and preserve the existing ChatGPT/Gemini routing chain; no shared queue/UI code is changed.
5. **Fails if stale adapter results are treated as complete.** The adapter reads only the current DOM, and the existing sidebar-load/queue safety constraints remain in force.

## Validation gap
The required requirements-brief validator is not present in this repository or installed skill directory. The approved brief follows the skill template; this absence is recorded rather than bypassed.
