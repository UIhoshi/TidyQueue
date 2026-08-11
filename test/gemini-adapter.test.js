const test = require('node:test');
const assert = require('node:assert/strict');
const { GeminiAdapter, geminiConversationIdFromHref, extractGeminiConversations } = require('../src/content/gemini-adapter.js');

test('geminiConversationIdFromHref accepts only a concrete Gemini app conversation route', () => {
  assert.equal(geminiConversationIdFromHref('https://gemini.google.com/app/abc-123'), 'abc-123');
  assert.equal(geminiConversationIdFromHref('https://gemini.google.com/app'), null);
  assert.equal(geminiConversationIdFromHref('https://gemini.google.com/app?hl=en'), null);
  assert.equal(geminiConversationIdFromHref('https://gemini.google.com/gem/foo'), null);
});

test('extractGeminiConversations keeps only unique titled regular conversations', () => {
  const links = [
    { href: 'https://gemini.google.com/app/first', innerText: 'First Gemini chat', textContent: 'First Gemini chat' },
    { href: 'https://gemini.google.com/app/first', innerText: 'First Gemini chat', textContent: 'First Gemini chat' },
    { href: 'https://gemini.google.com/app', innerText: 'Gemini home', textContent: 'Gemini home' },
    { href: 'https://gemini.google.com/app/blank', innerText: ' ', textContent: ' ' },
    { href: 'https://gemini.google.com/app/second', innerText: 'Second Gemini chat', textContent: 'Second Gemini chat' }
  ];
  const fakeDocument = { location: { origin: 'https://gemini.google.com' }, querySelectorAll: () => links };
  assert.deepEqual(extractGeminiConversations(fakeDocument).map(({ id, title }) => ({ id, title })), [
    { id: 'first', title: 'First Gemini chat' }, { id: 'second', title: 'Second Gemini chat' }
  ]);
});

test('Gemini adapter accepts delete only from a visible menu and confirmation dialog', () => {
  const hiddenDelete = { hidden: true, textContent: 'Delete', getAttribute: () => null };
  const visibleDelete = { hidden: false, textContent: 'Delete chat', getAttribute: () => null };
  const menu = { hidden: false, getAttribute: () => null, querySelectorAll: () => [hiddenDelete, visibleDelete] };
  const confirm = { hidden: false, textContent: 'Delete', getAttribute: () => null };
  const dialog = { hidden: false, getAttribute: () => null, querySelectorAll: () => [confirm] };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('menu') ? [menu] : selector.includes('dialog') ? [dialog] : []
  };
  const adapter = new GeminiAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), visibleDelete);
  assert.equal(adapter.findVisibleConfirmation(), confirm);
});
