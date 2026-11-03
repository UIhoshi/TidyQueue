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

test('ChatGPT adapter finds the ancestor that owns the visible more-actions button', () => {
  const unrelatedButton = { hidden: false, textContent: 'Pin', getAttribute: () => null };
  const moreButton = { hidden: false, textContent: 'More options', getAttribute: () => null };
  const actionRow = { parentElement: null, querySelectorAll: () => [moreButton] };
  const nestedCopy = { parentElement: actionRow, querySelectorAll: () => [unrelatedButton] };
  const link = { parentElement: nestedCopy };
  const adapter = new ConversationAdapter({}, {});
  assert.equal(adapter.closestActionContainer(link), actionRow);
});

test('ChatGPT adapter finds the deep Radix menu trigger button by aria-haspopup="menu" and ignores pin button', () => {
  const pinButton = { hidden: false, textContent: '', getAttribute: (name) => name === 'aria-label' ? 'チャットをピン留め' : null };
  const radixMenuTrigger = {
    hidden: false,
    textContent: '',
    getAttribute: (name) => name === 'aria-haspopup' ? 'menu' : name === 'aria-label' ? 'チャットのアクション' : null
  };
  const groupRow = { parentElement: null, querySelectorAll: () => [pinButton, radixMenuTrigger] };
  const level3 = { parentElement: groupRow, querySelectorAll: () => [] };
  const level2 = { parentElement: level3, querySelectorAll: () => [] };
  const level1 = { parentElement: level2, querySelectorAll: () => [] };
  const link = { parentElement: level1, querySelectorAll: () => [] };
  const adapter = new ConversationAdapter({}, {});
  const container = adapter.closestActionContainer(link);
  assert.equal(container, groupRow);
  assert.equal(adapter.findActionButton(container), radixMenuTrigger);
});


