const test = require('node:test');
const assert = require('node:assert/strict');
const { QueueSafetyGuard } = require('../src/content/queue-safety-guard.js');
const { QueueController } = require('../src/content/queue-controller.js');

function eventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    emit(type) { listeners.get(type)?.(); },
    listenerCount() { return listeners.size; }
  };
}

function createFixture() {
  let status = 'running';
  const reasons = [];
  const windowRef = eventTarget();
  const documentRef = { ...eventTarget(), hidden: false };
  const intervals = new Map();
  let nextIntervalId = 1;
  windowRef.setInterval = (callback) => {
    const id = nextIntervalId++;
    intervals.set(id, callback);
    return id;
  };
  windowRef.clearInterval = (id) => intervals.delete(id);
  const locationRef = { href: 'https://chatgpt.com/c/first' };
  const queue = {
    snapshot: () => ({ status }),
    pause: (reason) => { reasons.push(reason); status = 'paused'; }
  };
  return { queue, reasons, windowRef, documentRef, locationRef, intervals };
}

test('route change pauses a running queue and disposes monitoring', () => {
  const fixture = createFixture();
  const guard = new QueueSafetyGuard(fixture.queue, fixture);
  guard.start();

  fixture.locationRef.href = 'https://chatgpt.com/';
  assert.equal(guard.checkRoute(), true);
  assert.deepEqual(fixture.reasons, ['page-change']);
  assert.equal(guard.active, false);
  assert.equal(fixture.windowRef.listenerCount(), 0);
  assert.equal(fixture.documentRef.listenerCount(), 0);
  assert.equal(fixture.intervals.size, 0);
});

test('hidden document pauses a running queue', () => {
  const fixture = createFixture();
  const guard = new QueueSafetyGuard(fixture.queue, fixture);
  guard.start();

  fixture.documentRef.hidden = true;
  fixture.documentRef.emit('visibilitychange');

  assert.deepEqual(fixture.reasons, ['tab-hidden']);
  assert.equal(guard.active, false);
});

test('stopped monitoring no longer reacts to route events', () => {
  const fixture = createFixture();
  const guard = new QueueSafetyGuard(fixture.queue, fixture);
  guard.start();
  guard.stop();

  fixture.locationRef.href = 'https://chatgpt.com/c/other';
  fixture.windowRef.emit('popstate');

  assert.deepEqual(fixture.reasons, []);
  assert.equal(fixture.intervals.size, 0);
});

test('route pause prevents the queue from starting another deletion', async () => {
  const fixture = createFixture();
  const processed = [];
  let releaseFirst;
  const queue = new QueueController(async (item) => {
    processed.push(item.id);
    await new Promise((resolve) => { releaseFirst = resolve; });
  }, { milestoneEvery: 100 });
  const guard = new QueueSafetyGuard(queue, fixture);

  queue.start([{ id: 'first' }, { id: 'second' }]);
  guard.start();
  fixture.locationRef.href = 'https://chatgpt.com/';
  guard.checkRoute();
  releaseFirst();
  await new Promise((resolve) => setTimeout(resolve, 15));

  assert.deepEqual(processed, ['first']);
  assert.equal(queue.snapshot().pauseReason, 'page-change');
});
