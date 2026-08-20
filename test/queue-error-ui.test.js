const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

test('queue failures use a dedicated multi-line error callout without changing normal notices', () => {
  assert.match(source, /qd-has-error/);
  assert.match(source, /\.qd-modal>p\.qd-notice-error\{[^}]*height:64px[^}]*overflow:auto[^}]*color:#8d263b/);
  assert.match(source, /\.qd-progress\.qd-has-error\{grid-template-rows:[^}]*64px/);
});
