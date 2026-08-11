const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync(require.resolve('../src/content/content.js'), 'utf8');

test('plugin UI text cannot become a native selection range while the search field remains editable', () => {
  assert.match(source, /\.qd-shell\{[^}]*-webkit-user-select:none[^}]*user-select:none/);
  assert.match(source, /\.qd-search input\{[^}]*-webkit-user-select:text[^}]*user-select:text/);
});
