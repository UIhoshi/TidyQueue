# Architecture — Multi-Provider Adapters

## Change
TidyQueue keeps its existing Shadow-DOM UI and queue controller. Three independent DOM adapters add ordinary personal-history support for Copilot, Perplexity, and Kimi; the provider router selects them only on explicit registered hosts.

## Trust boundaries
- Browser page → adapter: currently rendered provider sidebar links and controls are untrusted DOM input; route helpers accept only narrow ordinary-conversation paths.
- Adapter → provider UI: deletion is performed only after the existing local review confirmation, through visible provider controls in the user’s signed-in page.

## Known assumptions and risks
- Provider route shapes and accessible controls can change. Bounded lookup/retry fails closed and pauses the existing queue; signed-in Chrome verification remains required.
- No new data store, provider API, remote service, or Chrome permission is introduced.

## Related documents
- [Flows](flows.md)
- [Permissions](permissions.md)
- [Variables](variables.md)
- [Derived tests](tests.md)