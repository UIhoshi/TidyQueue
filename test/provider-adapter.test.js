const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { ConversationAdapter } = require('../src/content/conversation-adapter.js');
const { GeminiAdapter } = require('../src/content/gemini-adapter.js');
const { CopilotAdapter } = require('../src/content/copilot-adapter.js');
const { PerplexityAdapter } = require('../src/content/perplexity-adapter.js');
const { KimiAdapter } = require('../src/content/kimi-adapter.js');

globalThis.ConversationAdapter = ConversationAdapter;
globalThis.GeminiAdapter = GeminiAdapter;
globalThis.CopilotAdapter = CopilotAdapter;
globalThis.PerplexityAdapter = PerplexityAdapter;
globalThis.KimiAdapter = KimiAdapter;
const { createProviderAdapter } = require('../src/content/provider-adapter.js');

test('provider router keeps every supported provider adapter separate by hostname', () => {
  const documentRef = { location: { origin: 'https://example.invalid' } };
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'chatgpt.com' } }) instanceof ConversationAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'gemini.google.com' } }) instanceof GeminiAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'copilot.com' } }) instanceof CopilotAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'copilot.microsoft.com' } }) instanceof CopilotAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'perplexity.ai' } }) instanceof PerplexityAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'www.perplexity.ai' } }) instanceof PerplexityAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'kimi.ai' } }) instanceof KimiAdapter);
  assert.ok(createProviderAdapter(documentRef, { location: { hostname: 'www.kimi.ai' } }) instanceof KimiAdapter);
});

test('provider router refuses unsupported hosts', () => {
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'example.com' } }), /Unsupported TidyQueue host/);
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'claude.ai' } }), /Unsupported TidyQueue host/);
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'kimi.com' } }), /Unsupported TidyQueue host/);
  assert.throws(() => createProviderAdapter({}, { location: { hostname: 'www.kimi.com' } }), /Unsupported TidyQueue host/);
});

test('provider adapters retain only the five supported provider families and no debugger permission', () => {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
  const contentScript = manifest.content_scripts[0];
  const popup = fs.readFileSync(path.join(root, 'src', 'popup', 'popup.js'), 'utf8');

  assert.deepEqual(manifest.permissions, ['activeTab']);
  assert.equal(manifest.permissions.includes('debugger'), false);
  assert.equal(contentScript.matches.includes('https://claude.ai/*'), false);
  assert.equal(contentScript.matches.includes('https://kimi.com/*'), false);
  assert.equal(contentScript.matches.includes('https://www.kimi.com/*'), false);
  assert.equal(contentScript.js.includes('src/content/claude-adapter.js'), false);
  for (const host of ['https://chatgpt.com/*', 'https://chat.openai.com/*', 'https://gemini.google.com/app*', 'https://copilot.com/*', 'https://copilot.microsoft.com/*', 'https://perplexity.ai/*', 'https://www.perplexity.ai/*', 'https://kimi.ai/*', 'https://www.kimi.ai/*']) assert.ok(contentScript.matches.includes(host));
  assert.deepEqual(contentScript.js.slice(-7), ['src/content/gemini-adapter.js', 'src/content/copilot-adapter.js', 'src/content/perplexity-adapter.js', 'src/content/kimi-adapter.js', 'src/content/provider-adapter.js', 'src/content/cleanup-session.js', 'src/content/content.js']);
  assert.ok(popup.includes('gemini\\.google\\.com'));
  assert.equal(popup.includes('claude\\.ai'), false);
  assert.ok(popup.includes('copilot\\.com'));
  assert.ok(popup.includes('perplexity\\.ai'));
  assert.ok(popup.includes('kimi\\.ai'));
});
