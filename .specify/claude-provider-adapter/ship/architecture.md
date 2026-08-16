# Architecture — Claude Provider Adapter

TidyQueue remains a local-only MV3 extension. `provider-adapter.js` routes `claude.ai` to the new `ClaudeAdapter`; all existing Shadow-DOM UI, queue, confirmation, safety guard, and in-memory state remain shared and unchanged. The adapter reads visible standard `/chat/<id>` anchors and invokes only the user-visible DOM controls for the selected row.

## Trust boundaries and risks
- Browser → Claude DOM: only current visible sidebar data is read; no API or remote service is called.
- Extension → destructive DOM action: TidyQueue review confirmation precedes the provider's visible native Delete action and confirmation dialog.
- Known risk: Claude's authenticated DOM can change. Missing/rebuilt controls fail closed and pause the queue. Logged-in browser verification is pending.

## Related documents
- [Flows](./flows.md)
- [Permissions](./permissions.md)
- [Variables](./variables.md)
- [Tests](./tests.md)
