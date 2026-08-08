const test = require('node:test');
const assert = require('node:assert/strict');
const { ConversationAdapter, conversationIdFromHref, inferRelativeAgeDays, extractConversations } = require('../src/content/conversation-adapter.js');

test('conversationIdFromHref reads a ChatGPT conversation id only', () => {
  assert.equal(conversationIdFromHref('https://chatgpt.com/c/abc-123'), 'abc-123');
  assert.equal(conversationIdFromHref('https://chatgpt.com/'), null);
});

test('extractConversations removes duplicate sidebar links and blank titles', () => {
  const links = [
    { href: 'https://chatgpt.com/c/a', innerText: 'First conversation', textContent: 'First conversation' },
    { href: 'https://chatgpt.com/c/a', innerText: 'First conversation', textContent: 'First conversation' },
    { href: 'https://chatgpt.com/c/b', innerText: '   ', textContent: '   ' },
    { href: 'https://chatgpt.com/c/c', innerText: 'Third conversation', textContent: 'Third conversation' }
  ];
  const fakeDocument = { location: { origin: 'https://chatgpt.com' }, querySelectorAll: () => links };
  assert.deepEqual(extractConversations(fakeDocument).map(({ id, title }) => ({ id, title })), [
    { id: 'a', title: 'First conversation' }, { id: 'c', title: 'Third conversation' }
  ]);
});
test('inferRelativeAgeDays recognizes a sidebar time-group heading', () => {
  const heading = { innerText: 'Previous 7 Days', textContent: 'Previous 7 Days', previousElementSibling: null };
  const parent = { previousElementSibling: heading, parentElement: null };
  assert.equal(inferRelativeAgeDays({ parentElement: parent }), 7);
});

test('adapter chooses a visible delete menu action only from an open menu', () => {
  const hiddenDelete = { hidden: true, textContent: 'Delete', getAttribute: () => null };
  const visibleDelete = { hidden: false, textContent: 'Delete conversation', getAttribute: () => null };
  const menu = { hidden: false, getAttribute: () => null, querySelectorAll: () => [hiddenDelete, visibleDelete] };
  const fakeDocument = { querySelectorAll: (selector) => selector.includes('role="menu"') ? [menu] : [] };
  const adapter = new ConversationAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(['delete']), visibleDelete);
});

test('adapter refuses a confirmation button outside a visible dialog', () => {
  const confirm = { hidden: false, textContent: 'Delete', getAttribute: () => null };
  const dialog = { hidden: false, getAttribute: () => null, querySelectorAll: () => [confirm] };
  const fakeDocument = { querySelectorAll: () => [dialog] };
  const adapter = new ConversationAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleConfirmation(['delete']), confirm);
});
