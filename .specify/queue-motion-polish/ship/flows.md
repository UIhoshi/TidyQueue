# Flows — Queue Motion Polish

## Successful deletion advance
1. The existing `QueueController` completes one explicitly confirmed deletion.
2. Its normal snapshot exposes the next ordered items.
3. `queueStateChanged()` batches same-turn emissions into one animation-frame render.
4. `showQueue()` calls `updateQueueRows()`.
5. If the old second/third IDs equal the new first/second IDs, the first row exits upward, retained rows move one slot upward, and the next third row enters from below. Otherwise the fixed rows patch directly.

## Safety states
Adapter failures, user pauses, stops, page changes, and hidden-tab pauses do not satisfy the forward-overlap condition, so they do not display a false successful advance.
