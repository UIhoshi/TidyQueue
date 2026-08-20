# Plan — Claude Support Removal

## Implementation

1. Remove the Claude host match and adapter script from the MV3 manifest, delete the adapter and
   its dedicated tests, and route `claude.ai` through the existing unsupported-host path.
2. Remove Claude from popup recognition, package validation, public documentation, and project
   maps. Update the release metadata consistently because the manifest permission/host surface
   changes.
3. Add regression coverage that prevents Claude support from being reintroduced accidentally;
   validate the remaining five-provider route chain and the unchanged `activeTab` permission.

## Red-Team Results

1. **Fails if Claude content scripts remain active.** Remove both its host match and script entry;
   package validation will assert their absence.
2. **Fails if the action popup still opens an unsupported Claude page.** Remove its hostname
   predicate and test the unsupported result through the provider router.
3. **Fails if removing one provider breaks another.** Keep the router's five remaining adapter
   assertions and run the full test suite.
4. **Fails if a higher-risk permission is introduced while trying to support Claude.** Keep the
   permission list exactly `activeTab` and assert that `debugger` is absent.
5. **Fails if stale documentation misrepresents privacy or support.** Update README, privacy
   policy, project rules, and both project maps in this same change.
