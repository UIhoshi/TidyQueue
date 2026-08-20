# Flows — Multi-Provider Adapters

## Review and delete an ordinary provider conversation
1. **Actor:** signed-in user on an explicit Copilot, Perplexity, or Kimi host.
2. The popup/launcher opens the unchanged local control center; the hostname router creates only the matching adapter.
3. The adapter reads current visible sidebar links, accepting only its ordinary route shape and ignoring projects, spaces, shared pages, and workspace-like paths.
4. The user selects conversations and explicitly confirms the unchanged review queue.
5. For each selected ID, the adapter re-finds that sidebar row, reveals its controls, and clicks Delete only from a visible menu, then only a visible confirmation dialog.
6. The adapter waits for sidebar removal or the closing final confirmation. Missing/ambiguous controls or outcomes throw; QueueController pauses before another item begins.

## Boundaries
- The browser page controls deletion; TidyQueue does not call provider APIs.
- Existing QueueSafetyGuard pauses active work on route changes or a hidden tab.