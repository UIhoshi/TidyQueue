const test = require('node:test');
const assert = require('node:assert/strict');
const { QueueController } = require('../src/content/queue-controller.js');
const { refreshBatchState } = require('../src/content/cleanup-session.js');

const waitFor = async (predicate, timeoutMs = 200) => {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 2));
  }
  throw new Error('Timed out waiting for queue completion');
};

const batch = (prefix, total) => Array.from({ length: total }, (_, index) => ({ id: `${prefix}-${index}` }));

test('refreshBatchState replaces deleted-batch data with a fresh provider snapshot', () => {
  const oldSelection = new Set(['deleted-1', 'deleted-2']);
  const state = {
    items: [{ id: 'deleted-1' }, { id: 'deleted-2' }],
    selected: oldSelection,
    selectionAnchorId: 'deleted-2'
  };
  const freshItems = [{ id: 'next-1' }, { id: 'next-2' }];

  const result = refreshBatchState(state, freshItems);

  assert.equal(result, state);
  assert.deepEqual(state.items, freshItems);
  assert.notEqual(state.selected, oldSelection);
  assert.deepEqual([...state.selected], []);
  assert.equal(state.selectionAnchorId, null);
});

test('refreshBatchState safely accepts an empty current sidebar snapshot', () => {
  const state = { items: [{ id: 'old' }], selected: new Set(['old']), selectionAnchorId: 'old' };

  refreshBatchState(state, []);

  assert.deepEqual(state.items, []);
  assert.deepEqual([...state.selected], []);
  assert.equal(state.selectionAnchorId, null);
});

test('each completed batch can hand off to a later selected batch without retaining old IDs', async () => {
  const processed = [];
  const processItem = async (item) => processed.push(item.id);
  const batches = [batch('first', 17), batch('second', 26), batch('third', 14)];
  const state = { items: batches[0], selected: new Set(batches[0].map((item) => item.id)), selectionAnchorId: batches[0].at(-1).id };

  for (const [index, selectedBatch] of batches.entries()) {
    if (index > 0) {
      refreshBatchState(state, selectedBatch);
      selectedBatch.forEach((item) => state.selected.add(item.id));
    }
    const queue = new QueueController(processItem, { milestoneEvery: 100 });
    queue.start(state.items.filter((item) => state.selected.has(item.id)));
    await waitFor(() => queue.snapshot().status === 'completed');
    assert.equal(queue.snapshot().completed, selectedBatch.length);
  }

  assert.deepEqual(processed, batches.flat().map((item) => item.id));
});
