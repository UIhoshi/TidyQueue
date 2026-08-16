const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ConversationAdapter } = require('../src/content/conversation-adapter.js');
const { GeminiAdapter } = require('../src/content/gemini-adapter.js');
const { ClaudeAdapter } = require('../src/content/claude-adapter.js');

globalThis.ConversationAdapter = ConversationAdapter;
globalThis.GeminiAdapter = GeminiAdapter;
globalThis.ClaudeAdapter = ClaudeAdapter;
const { createProviderAdapter } = require('../src/content/provider-adapter.js');

test('provider router keeps ChatGPT, Gemini, and Claude adapters separate by hostname', () => {
  const documentRef = { location: { origin: 'https://example.invalid' } };
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'chatgpt.com' } }) instanceof ConversationAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'gemini.google.com' } }) instanceof GeminiAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'claude.ai' } }) instanceof ClaudeAdapter);
});

test('provider router refuses unsupported hosts', () => {
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'example.com' } }), /Unsupported TidyQueue host/);
});

test('provider adapters are registered without expanding the extension permission model', () => {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const contentScript = manifest.content_scripts[0];
  const popup = fs.readFileSync(path.join(root, 'src', 'popup', 'popup.js'), 'utf8');

  assert.deepEqual(manifest.permissions, ['activeTab']);
  for (const host of ['https://chatgpt.com/*', 'https://chat.openai.com/*', 'https://gemini.google.com/app*', 'https://claude.ai/*']) assert.ok(contentScript.matches.includes(host));
  assert.deepEqual(contentScript.js.slice(-5), ['src/content/gemini-adapter.js', 'src/content/claude-adapter.js', 'src/content/provider-adapter.js', 'src/content/cleanup-session.js', 'src/content/content.js']);
  assert.ok(popup.includes('gemini\\.google\\.com'));
  assert.ok(popup.includes('claude\\.ai'));
});
