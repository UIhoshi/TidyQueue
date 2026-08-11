const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ConversationAdapter } = require('../src/content/conversation-adapter.js');
const { GeminiAdapter } = require('../src/content/gemini-adapter.js');

globalThis.ConversationAdapter = ConversationAdapter;
globalThis.GeminiAdapter = GeminiAdapter;
const { createProviderAdapter } = require('../src/content/provider-adapter.js');

test('provider router keeps ChatGPT and Gemini adapters separate by hostname', () => {
  const documentRef = { location: { origin: 'https://example.invalid' } };
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'chatgpt.com' } }) instanceof ConversationAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'gemini.google.com' } }) instanceof GeminiAdapter);
});

test('provider router refuses unsupported hosts', () => {
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'example.com' } }), /Unsupported TidyQueue host/);
});

test('Gemini is registered without expanding the extension permission model', () => {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const contentScript = manifest.content_scripts[0];
  assert.deepEqual(manifest.permissions, ['activeTab']);
  assert.ok(contentScript.matches.includes('https://gemini.google.com/app*'));
  assert.deepEqual(contentScript.js.slice(-3), ['src/content/gemini-adapter.js', 'src/content/provider-adapter.js', 'src/content/content.js']);
  assert.ok(fs.readFileSync(path.join(root, 'src', 'popup', 'popup.js'), 'utf8').includes('gemini\\.google\\.com\\/app'));
});
