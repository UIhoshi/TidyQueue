const test = require('node:test');
const assert = require('node:assert/strict');
const { QueueController } = require('../src/content/queue-controller.js');

test('queue completes items in sequence', async () => {
  const processed = [];
  let final;
  const queue = new QueueController(async (item) => processed.push(item.id), { milestoneEvery: 100, onChange: (snapshot) => { final = snapshot; } });
  queue.start([{ id: 'a' }, { id: 'b' }]);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(processed, ['a', 'b']);
  assert.equal(final.status, 'completed');
  assert.equal(final.completed, 2);
});

test('queue pauses on an item failure and keeps remaining work', async () => {
  const queue = new QueueController(async () => { throw new Error('selector missing'); }, { milestoneEvery: 100 });
  queue.start([{ id: 'a' }, { id: 'b' }]);
  await new Promise((resolve) => setTimeout(resolve, 15));
  const result = queue.snapshot();
  assert.equal(result.status, 'paused');
  assert.equal(result.pauseReason, 'failure');
  assert.equal(result.completed, 0);
  assert.match(result.error, /selector missing/);
});

test('queue waits briefly at a pacing milestone', async () => {
  const processed = [];
  let release;
  const sleep = () => new Promise((resolve) => { release = resolve; });
  const queue = new QueueController(async (item) => processed.push(item.id), { milestoneEvery: 2, sleep });
  queue.start([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(processed, ['a', 'b']);
  assert.equal(queue.snapshot().pauseReason, 'milestone');
  release();
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(processed, ['a', 'b', 'c']);
  assert.equal(queue.snapshot().status, 'completed');
});

test('stop prevents unstarted items from running', async () => {
  const processed = [];
  let continueFirst;
  const queue = new QueueController(async (item) => { processed.push(item.id); await new Promise((resolve) => { continueFirst = resolve; }); }, { milestoneEvery: 100 });
  queue.start([{ id: 'a' }, { id: 'b' }]);
  await new Promise((resolve) => setTimeout(resolve, 5));
  queue.stop();
  continueFirst();
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(processed, ['a']);
  assert.equal(queue.snapshot().status, 'stopped');
});

test('queue applies the configured delay between successful items', async () => {
  const delays = [];
  const processed = [];
  const queue = new QueueController(async (item) => processed.push(item.id), {
    milestoneEvery: 100,
    interItemDelayMs: 2000,
    sleep: async (milliseconds) => delays.push(milliseconds)
  });
  queue.start([{ id: 'a' }, { id: 'b' }]);
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.deepEqual(processed, ['a', 'b']);
  assert.deepEqual(delays, [2000]);
  assert.equal(queue.snapshot().status, 'completed');
});
