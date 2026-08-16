# Repeat Cleanup Plan

## Approach
- Extract the existing "refresh provider list and clear selection" operation into a small content-session helper, shared by initial open and the new-batch action.
- Add a completed-only `next-batch` action to the persistent queue panel. It refreshes only the in-memory state and removes the queue modal; it does not initiate deletion.
- Keep the existing review and explicit confirmation path unchanged.

## Red-team results
1. **Fails if the action can accidentally delete a refreshed item.** Mitigation: it only refreshes state and renders the selection surface; it never invokes `startQueue`.
2. **Fails if stale selected IDs survive a completed batch.** Mitigation: replace the selection Set and reset the selection anchor in the shared helper; cover with a unit test.
3. **Fails if a provider list is temporarily empty.** Mitigation: return to the existing empty-state UI; no queue can start without a new user selection and review.
4. **Fails if localization gets out of sync.** Mitigation: add the key to all catalogs and retain catalog-completeness validation.
