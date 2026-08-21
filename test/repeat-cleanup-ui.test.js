const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

test('completed queue offers an in-panel fresh-batch action wired to localized copy', () => {
  const content = fs.readFileSync(path.join(root, 'src', 'content', 'content.js'), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const scripts = manifest.content_scripts[0].js;

  assert.match(content, /data-queue="next-batch" data-action="next-batch"/);
  assert.match(content, /snapshot\.status !== 'completed'/);
  assert.match(content, /async function beginNextBatch\(\)/);
  assert.match(content, /async function collectConversations\(\)/);
  assert.match(content, /refreshBatchState\(state, await collectConversations\(\)\)/);
  assert.match(content, /t\('deleteMore'\)/);
  assert.ok(scripts.indexOf('src/content/cleanup-session.js') >= 0);
  assert.ok(scripts.indexOf('src/content/cleanup-session.js') < scripts.indexOf('src/content/content.js'));
});
