const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

test('conversation loading guidance is a prominent notice directly above the results', () => {
  assert.match(source, /<aside class="qd-load-notice" role="note">/);
  assert.match(source, /t\('sidebarLoadHintTitle'\)/);
  assert.match(source, /t\('sidebarLoadHint'\)/);
  assert.match(source, /\.qd-load-notice\{[^}]*border:1px solid[^}]*box-shadow:inset 3px 0/);
  assert.match(source, /\.qd-load-notice\{[^}]*margin:0 24px 10px/);
});
