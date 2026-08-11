const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

test('visual conversation cards contain long title and summary text', () => {
  assert.match(source, /\.qd-card\{[^}]*overflow:hidden/);
  assert.match(source, /\.qd-card h2\{[^}]*-webkit-line-clamp:2/);
  assert.match(source, /\.qd-card p\{[^}]*-webkit-line-clamp:2/);
  assert.match(source, /\.qd-list \.qd-card h2\{[^}]*white-space:nowrap[^}]*text-overflow:ellipsis/);
});
