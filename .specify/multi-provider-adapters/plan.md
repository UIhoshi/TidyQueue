# Plan — Copilot, Perplexity, and Kimi Provider Adapters

## Implementation
1. Add pure route/list helpers and self-contained fail-closed adapters for Copilot, Perplexity, and Kimi. Reuse the established bounded retry, selected-row control discovery, visible-menu, visible-dialog, and sidebar-outcome patterns; do not modify shared queue, layout, or interaction code.
2. Register the adapters in the content-script order and provider router. Extend only the manifest hosts and popup supported-host predicate needed for the providers, preserving `activeTab` as the sole permission; make existing supported-provider status text provider-neutral without changing layout.
3. Add targeted tests for allowed routes, excluded non-conversation paths, unique titled extraction, visible destructive controls, provider selection, and release registration.
4. Update project/code maps and record any material correction in the error log. Run the required validation commands; record live-browser verification as pending until performed on signed-in tabs.

## Red-Team Results
1. **Fails if a project, shared page, or workspace object is deleted.** Each route helper must accept a narrow ordinary-conversation URL shape and explicitly reject known non-conversation path families; empty titles and duplicate IDs are excluded.
2. **Fails if an unrelated page control is clicked.** The selected entry is re-found before action discovery; Delete is accepted only from a visible menu and confirmation only from a visible dialog/alert dialog.
3. **Fails if provider DOM changes or renders asynchronously.** Discovery and action lookup are bounded; inability to prove the selected target/control raises an error, allowing the existing queue to pause rather than guessing.
4. **Fails if a new provider expands privileges or affects established providers/UI.** Tests enforce the unchanged permission model and preserve separate hostname routing; shared queue and UI files are not edited.
5. **Fails if tests are mistaken for live-provider proof.** Package/unit tests only establish static behavior; manual logged-in Chrome tests with disposable conversations remain mandatory and separately reported.
6. **Fails if broad host matches include lookalike or unrelated product surfaces.** Only explicit HTTPS provider host patterns are registered, and the popup/router reject unknown hostnames.

## Validation gap
Live DOM selectors cannot be fully verified without signed-in provider sessions. The implementation must retain this gap explicitly rather than overclaiming browser verification.
