const test = require('node:test');
const assert = require('node:assert/strict');
const { ClaudeAdapter, claudeConversationIdFromHref, extractClaudeConversations } = require('../src/content/claude-adapter.js');

test('claudeConversationIdFromHref accepts only a concrete standard Claude chat route', () => {
  assert.equal(claudeConversationIdFromHref('https://claude.ai/chat/abc-123'), 'abc-123');
  assert.equal(claudeConversationIdFromHref('https://claude.ai/chat/abc-123?foo=bar'), 'abc-123');
  assert.equal(claudeConversationIdFromHref('https://claude.ai/chat'), null);
  assert.equal(claudeConversationIdFromHref('https://claude.ai/project/project-1/chat/abc-123'), null);
  assert.equal(claudeConversationIdFromHref('https://claude.ai/share/abc-123'), null);
});

test('extractClaudeConversations keeps only unique titled standard chats', () => {
  const links = [
    { href: 'https://claude.ai/chat/first', innerText: 'First Claude chat', textContent: 'First Claude chat' },
    { href: 'https://claude.ai/chat/first', innerText: 'First Claude chat', textContent: 'First Claude chat' },
    { href: 'https://claude.ai/chat', innerText: 'Claude home', textContent: 'Claude home' },
    { href: 'https://claude.ai/chat/blank', innerText: ' ', textContent: ' ' },
    { href: 'https://claude.ai/project/project-1/chat/project-chat', innerText: 'Project chat', textContent: 'Project chat' },
    { href: 'https://claude.ai/chat/second', innerText: 'Second Claude chat', textContent: 'Second Claude chat' }
  ];
  const fakeDocument = { location: { origin: 'https://claude.ai' }, querySelectorAll: () => links };
  assert.deepEqual(extractClaudeConversations(fakeDocument).map(({ id, title }) => ({ id, title })), [
    { id: 'first', title: 'First Claude chat' }, { id: 'second', title: 'Second Claude chat' }
  ]);
});

test('Claude adapter accepts delete only from a visible menu and confirmation dialog', () => {
  const hiddenDelete = { hidden: true, textContent: 'Delete', getAttribute: () => null };
  const visibleDelete = { hidden: false, textContent: 'Delete chat', getAttribute: () => null };
  const menu = { hidden: false, getAttribute: () => null, querySelectorAll: () => [hiddenDelete, visibleDelete] };
  const confirm = { hidden: false, textContent: 'Delete', getAttribute: () => null };
  const dialog = { hidden: false, getAttribute: () => null, querySelectorAll: () => [confirm] };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('menu') ? [menu] : selector.includes('dialog') ? [dialog] : []
  };
  const adapter = new ClaudeAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), visibleDelete);
  assert.equal(adapter.findVisibleConfirmation(), confirm);
});

test('Claude adapter finds the ancestor that actually owns the visible more-actions button', () => {
  const unrelatedButton = { hidden: false, textContent: 'Pin', getAttribute: () => null };
  const moreButton = { hidden: false, textContent: 'More options', getAttribute: () => null };
  const actionRow = { parentElement: null, querySelectorAll: () => [moreButton] };
  const nestedCopy = { parentElement: actionRow, querySelectorAll: () => [unrelatedButton] };
  const link = { parentElement: nestedCopy };
  const adapter = new ClaudeAdapter({}, {});
  assert.equal(adapter.findActionContainer(link), actionRow);
});
