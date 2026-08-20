const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

test('live deletion queue preserves an explicit 100/75/50 opacity hierarchy', () => {
  assert.match(source, /const QUEUE_ROW_OPACITY = \[1, \.75, \.5\]/);
  assert.match(source, /data-queue-depth="1"\]\{opacity:\.75\}/);
  assert.match(source, /data-queue-depth="2"\]\{opacity:\.5\}/);
});

test('one completed deletion advances the live queue upward instead of fading every slot', () => {
  assert.match(source, /function isOneRowAdvance\(rows, upcoming\)/);
  assert.match(source, /previousIds\[1\] === nextIds\[0\] && previousIds\[2\] === nextIds\[1\]/);
  assert.match(source, /function animateQueueAdvance\(list, rows, upcoming, sequenceStart\)/);
  assert.match(source, /list\.appendChild\(leaving\)/);
  assert.match(source, /qd-queue-leaving/);
  assert.match(source, /translateY\(-\$\{QUEUE_ROW_HEIGHT\}px\)/);
  assert.match(source, /translateY\(\$\{QUEUE_ROW_HEIGHT\}px\)/);
});

test('live queue movement respects reduced-motion preferences and maintains a fixed viewport', () => {
  assert.match(source, /prefers-reduced-motion: reduce/);
  assert.match(source, /\.qd-progress \.qd-live-list\{position:relative;overflow:hidden/);
  assert.match(source, /\.qd-progress \.qd-live-list \.qd-upcoming\{height:44px;min-height:44px/);
});