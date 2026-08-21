const test = require('node:test');
const assert = require('node:assert/strict');
const { CopilotAdapter, copilotConversationIdFromHref, copilotConversationIdFromElement, extractCopilotConversations, findCopilotHistoryList, findScrollableAncestor, findScrollableAncestors } = require('../src/content/copilot-adapter.js');
const { PerplexityAdapter, perplexityConversationIdFromHref, extractPerplexityConversations } = require('../src/content/perplexity-adapter.js');
const { KimiAdapter, kimiConversationIdFromHref, extractKimiConversations } = require('../src/content/kimi-adapter.js');

const providerCases = [
  {
    name: 'Copilot',
    Adapter: CopilotAdapter,
    idFromHref: copilotConversationIdFromHref,
    extract: extractCopilotConversations,
    accepted: 'https://copilot.com/chats/first',
    excluded: ['https://copilot.com/chats', 'https://copilot.com/chat', 'https://copilot.com/projects/project-1'],
    duplicate: 'https://copilot.com/chats/first',
    second: 'https://copilot.com/chats/second'
  },
  {
    name: 'Perplexity',
    Adapter: PerplexityAdapter,
    idFromHref: perplexityConversationIdFromHref,
    extract: extractPerplexityConversations,
    accepted: 'https://www.perplexity.ai/search/first-thread',
    excluded: ['https://www.perplexity.ai/search', 'https://www.perplexity.ai/spaces/project-1', 'https://www.perplexity.ai/collection/first-thread'],
    duplicate: 'https://www.perplexity.ai/search/first-thread',
    second: 'https://www.perplexity.ai/search/second-thread'
  },
  {
    name: 'Kimi',
    Adapter: KimiAdapter,
    idFromHref: kimiConversationIdFromHref,
    extract: extractKimiConversations,
    accepted: 'https://www.kimi.ai/chat/first',
    excluded: ['https://www.kimi.ai/chat', 'https://www.kimi.ai/project/project-1/chat/first', 'https://www.kimi.ai/projects/project-1'],
    duplicate: 'https://www.kimi.ai/chat/first',
    second: 'https://www.kimi.ai/chat/second'
  }
];

for (const provider of providerCases) {
  test(`${provider.name} accepts only a concrete ordinary conversation route`, () => {
    assert.equal(provider.idFromHref(provider.accepted), provider.name === 'Perplexity' ? 'first-thread' : 'first');
    for (const href of provider.excluded) assert.equal(provider.idFromHref(href), null);
  });

  test(`${provider.name} extracts only unique titled ordinary conversations`, () => {
    const links = [
      { href: provider.accepted, innerText: `First ${provider.name} conversation`, textContent: `First ${provider.name} conversation` },
      { href: provider.duplicate, innerText: `First ${provider.name} conversation`, textContent: `First ${provider.name} conversation` },
      { href: provider.excluded[0], innerText: 'Provider home', textContent: 'Provider home' },
      { href: provider.excluded[1], innerText: 'Excluded workspace content', textContent: 'Excluded workspace content' },
      { href: provider.second, innerText: ' ', textContent: ' ' },
      { href: provider.second, innerText: `Second ${provider.name} conversation`, textContent: `Second ${provider.name} conversation` }
    ];
    const fakeDocument = { location: { origin: new URL(provider.accepted).origin }, querySelectorAll: () => links };
    assert.deepEqual(provider.extract(fakeDocument).map(({ id, title }) => ({ id, title })), [
      { id: provider.name === 'Perplexity' ? 'first-thread' : 'first', title: `First ${provider.name} conversation` },
      { id: provider.name === 'Perplexity' ? 'second-thread' : 'second', title: `Second ${provider.name} conversation` }
    ]);
  });

  test(`${provider.name} accepts delete only from a visible menu and confirmation dialog`, () => {
    const hiddenDelete = { hidden: true, textContent: 'Delete', getAttribute: () => null };
    const visibleDelete = { hidden: false, textContent: 'Delete conversation', getAttribute: () => null };
    const menu = { hidden: false, getAttribute: () => null, querySelectorAll: () => [hiddenDelete, visibleDelete] };
    const confirm = { hidden: false, textContent: 'Delete', getAttribute: () => null };
    const dialog = { hidden: false, getAttribute: () => null, querySelectorAll: () => [confirm] };
    const fakeDocument = {
      querySelectorAll: (selector) => selector.includes('menu') ? [menu] : selector.includes('dialog') ? [dialog] : []
    };
    const adapter = new provider.Adapter(fakeDocument, {});
    assert.equal(adapter.findVisibleMenuAction(), visibleDelete);
    assert.equal(adapter.findVisibleConfirmation(), confirm);
  });

  test(`${provider.name} finds the ancestor that owns the visible more-actions button`, () => {
    const unrelatedButton = { hidden: false, textContent: 'Pin', getAttribute: () => null };
    const moreButton = { hidden: false, textContent: 'More options', getAttribute: () => null };
    const actionRow = { parentElement: null, querySelectorAll: () => [moreButton] };
    const nestedCopy = { parentElement: actionRow, querySelectorAll: () => [unrelatedButton] };
    const link = { parentElement: nestedCopy };
    const adapter = new provider.Adapter({}, {});
    assert.equal(adapter.findActionContainer(link), actionRow);
  });
}
test('Copilot scans the current role-link sidebar item using its conversation-options id', () => {
  const optionControl = { id: 'conversation-options-conversation-42', getAttribute: (name) => name === 'id' ? 'conversation-options-conversation-42' : null };
  const titleNode = { textContent: 'Visible Copilot conversation', getAttribute: (name) => name === 'title' ? 'Visible Copilot conversation' : null };
  const sidebarItem = {
    href: '',
    innerText: 'Visible Copilot conversation',
    textContent: 'Visible Copilot conversation',
    querySelector: (selector) => selector.includes('conversation-options-') ? optionControl : selector === 'p[title]' ? titleNode : null
  };
  const fakeDocument = {
    location: { origin: 'https://copilot.microsoft.com' },
    querySelectorAll: (selector) => selector === '[role="list"] [role="link"]' ? [sidebarItem] : []
  };
  assert.equal(copilotConversationIdFromElement(sidebarItem), 'conversation-42');
  assert.deepEqual(extractCopilotConversations(fakeDocument).map(({ id, title }) => ({ id, title })), [
    { id: 'conversation-42', title: 'Visible Copilot conversation' }
  ]);
});
test('Copilot uses the provider conversation-options control for the selected row action', () => {
  const providerOption = { id: 'conversation-options-conversation-42', hidden: false, textContent: '', getAttribute: () => null };
  const unrelatedButton = { id: '', hidden: false, textContent: 'Pin', getAttribute: () => null };
  const container = {
    querySelector: (selector) => selector.includes('conversation-options-') ? providerOption : null,
    querySelectorAll: () => [unrelatedButton, providerOption]
  };
  const adapter = new CopilotAdapter({}, {});
  assert.equal(adapter.findActionButton(container), providerOption);
});
test('Copilot supports the current ordinary chat route aliases but excludes group and Library routes', () => {
  for (const href of [
    'https://copilot.microsoft.com/chats/first',
    'https://copilot.microsoft.com/chat/first',
    'https://copilot.microsoft.com/conversations/first'
  ]) assert.equal(copilotConversationIdFromHref(href), 'first');
  for (const href of [
    'https://copilot.microsoft.com/conversations/join/shared-chat',
    'https://copilot.microsoft.com/library',
    'https://copilot.microsoft.com/projects/project-1'
  ]) assert.equal(copilotConversationIdFromHref(href), null);
});

test('Copilot ignores non-conversation anchors while scanning the sidebar', () => {
  const links = [
    { href: 'https://copilot.microsoft.com/library', innerText: 'Library', textContent: 'Library' },
    { href: 'https://copilot.microsoft.com/conversations/first', innerText: 'First conversation', textContent: 'First conversation' }
  ];
  const fakeDocument = { location: { origin: 'https://copilot.microsoft.com' }, querySelectorAll: () => links };
  assert.deepEqual(extractCopilotConversations(fakeDocument).map(({ id, title }) => ({ id, title })), [
    { id: 'first', title: 'First conversation' }
  ]);
});
test('Copilot finds Delete inside its current floating-menu root', () => {
  const deleteAction = { hidden: false, textContent: 'Delete', getAttribute: () => null };
  const floatingMenu = { hidden: false, getAttribute: () => null, querySelectorAll: () => [deleteAction] };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('data-outside-events-ignore') ? [floatingMenu] : []
  };
  const adapter = new CopilotAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), deleteAction);
});
test('Copilot finds the Chinese Delete action when the provider exposes it as a focusable menu div', () => {
  const menuWrapper = { hidden: false, textContent: '固定对话 重命名 删除', getAttribute: () => null };
  const deleteAction = { hidden: false, textContent: '删除', getAttribute: (name) => name === 'tabindex' ? '0' : null };
  const menu = {
    hidden: false,
    getAttribute: () => null,
    querySelectorAll: () => [menuWrapper, deleteAction]
  };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('role="menu"') ? [menu] : []
  };
  const adapter = new CopilotAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), deleteAction);
});
test('Copilot can use a mounted hidden menu only when its Delete action names the selected conversation', () => {
  const selectedDelete = {
    hidden: false,
    textContent: '删除',
    getAttribute: (name) => name === 'title' ? '删除对话，Selected conversation' : null
  };
  const otherDelete = {
    hidden: false,
    textContent: '删除',
    getAttribute: (name) => name === 'title' ? '删除对话，Other conversation' : null
  };
  const hiddenMenu = {
    hidden: false,
    getAttribute: () => null,
    querySelectorAll: () => [otherDelete, selectedDelete]
  };
  const fakeDocument = {
    querySelectorAll: () => [hiddenMenu]
  };
  const originalGetComputedStyle = global.getComputedStyle;
  global.getComputedStyle = () => ({ display: 'flex', visibility: 'hidden' });
  try {
    const adapter = new CopilotAdapter(fakeDocument, {});
    assert.equal(adapter.findVisibleMenuAction(), null);
    assert.equal(adapter.findSelectedHiddenMenuAction({ title: 'Selected conversation' }), selectedDelete);
    assert.equal(adapter.findSelectedHiddenMenuAction({ title: 'Missing conversation' }), null);
  } finally {
    global.getComputedStyle = originalGetComputedStyle;
  }
});
test('Copilot finds the scrollable history viewport from a current sidebar row', () => {
  const scroller = { scrollHeight: 900, clientHeight: 300, parentElement: null };
  const staticWrapper = { scrollHeight: 300, clientHeight: 300, parentElement: scroller };
  const row = { parentElement: staticWrapper };
  assert.equal(findScrollableAncestor(row), scroller);
});
test('Copilot includes every scrollable ancestor that can own a lazy history sentinel', () => {
  const outerScroller = { scrollHeight: 1400, clientHeight: 500, parentElement: null };
  const innerScroller = { scrollHeight: 900, clientHeight: 260, parentElement: outerScroller };
  const row = { parentElement: innerScroller };
  assert.deepEqual(findScrollableAncestors(row), [innerScroller, outerScroller]);
});
test('Copilot limits auto-loading to the history list with a stable conversation id', () => {
  const navigationRow = { querySelector: () => null };
  const conversationRow = { querySelector: () => ({ id: 'conversation-options-conversation-42', getAttribute: () => 'conversation-options-conversation-42' }) };
  const navigationList = { querySelectorAll: () => [navigationRow] };
  const historyList = { querySelectorAll: () => [conversationRow] };
  const fakeDocument = { location: { origin: 'https://copilot.microsoft.com' }, querySelectorAll: () => [navigationList, historyList] };
  assert.equal(findCopilotHistoryList(fakeDocument), historyList);
});
test('Copilot loads its lazy history viewport and restores the user scroll position', async () => {
  let scrollTop = 60;
  const scroller = {
    scrollHeight: 960,
    clientHeight: 240,
    parentElement: null,
    get scrollTop() { return scrollTop; },
    set scrollTop(value) { scrollTop = value; }
  };
  const row = { querySelector: (selector) => selector.includes('conversation-options-') ? { id: 'conversation-options-conversation-42', getAttribute: () => 'conversation-options-conversation-42' } : null };
  const historyList = { parentElement: scroller, querySelectorAll: (selector) => selector.includes('role="link"') ? [row] : [] };
  row.parentElement = historyList;
  const fakeDocument = { location: { origin: 'https://copilot.microsoft.com' }, querySelectorAll: (selector) => selector === '[role="list"]' ? [historyList] : [] };
  const adapter = new CopilotAdapter(fakeDocument, {});
  adapter.list = () => [{ id: 'conversation-42', element: row }];
  assert.deepEqual(await adapter.prepareList({ maxSteps: 8, waitMs: 0 }), [{ id: 'conversation-42', element: row }]);
  assert.equal(scrollTop, 60);
});
test('Copilot also clicks the provider-scoped Show more control while loading history', async () => {
  let clickCount = 0;
  const more = { hidden: false, disabled: false, textContent: 'Show more', getAttribute: () => null, click() { clickCount += 1; this.disabled = true; } };
  const scroller = { scrollHeight: 240, clientHeight: 240, scrollTop: 0, parentElement: null };
  const row = { querySelector: (selector) => selector.includes('conversation-options-') ? { id: 'conversation-options-conversation-42', getAttribute: () => 'conversation-options-conversation-42' } : null };
  const historyList = { parentElement: scroller, querySelectorAll: (selector) => selector.includes('role="link"') ? [row] : [more] };
  row.parentElement = historyList;
  const fakeDocument = { location: { origin: 'https://copilot.microsoft.com' }, querySelectorAll: (selector) => selector === '[role="list"]' ? [historyList] : [] };
  const adapter = new CopilotAdapter(fakeDocument, {});
  adapter.list = () => [{ id: 'conversation-42', element: row }];
  await adapter.prepareList({ maxSteps: 4, waitMs: 0 });
  assert.equal(clickCount, 1);
});
test('Copilot brings the history sentinel into view and restores all affected scroll positions', async () => {
  let sentinelCalls = 0;
  const outerScroller = { scrollHeight: 1400, clientHeight: 500, scrollTop: 80, parentElement: null };
  const innerScroller = { scrollHeight: 900, clientHeight: 260, scrollTop: 40, parentElement: outerScroller };
  const row = { querySelector: (selector) => selector.includes('conversation-options-') ? { id: 'conversation-options-conversation-42', getAttribute: () => 'conversation-options-conversation-42' } : null };
  const sentinel = { scrollIntoView: () => { sentinelCalls += 1; } };
  const historyList = { parentElement: innerScroller, lastElementChild: sentinel, querySelectorAll: (selector) => selector.includes('role="link"') ? [row] : [] };
  row.parentElement = historyList;
  const fakeDocument = { location: { origin: 'https://copilot.microsoft.com' }, querySelectorAll: (selector) => selector === '[role="list"]' ? [historyList] : [] };
  let restoredWindowY = null;
  const adapter = new CopilotAdapter(fakeDocument, { scrollY: 30, scrollTo: ({ top }) => { restoredWindowY = top; } });
  adapter.list = () => [{ id: 'conversation-42', element: row }];
  await adapter.prepareList({ maxSteps: 4, waitMs: 0 });
  assert.ok(sentinelCalls > 0);
  assert.equal(innerScroller.scrollTop, 40);
  assert.equal(outerScroller.scrollTop, 80);
  assert.equal(restoredWindowY, 30);
});
test('Kimi finds the native confirmation button inside its visible modal mask', () => {
  const confirmDelete = { hidden: false, textContent: '删除', getAttribute: () => null };
  const modalMask = { hidden: false, getAttribute: () => null, querySelectorAll: () => [confirmDelete] };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('.modal-mask') ? [modalMask] : []
  };
  const adapter = new KimiAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleConfirmation(), confirmDelete);
});
test('Kimi finds Delete in a visible provider popup without semantic menu roles', () => {
  const deleteAction = { hidden: false, textContent: '删除', getAttribute: () => null };
  const popup = { hidden: false, getAttribute: () => null, querySelectorAll: () => [deleteAction] };
  const fakeDocument = {
    querySelectorAll: (selector) => selector.includes('data-state="open"') ? [popup] : []
  };
  const adapter = new KimiAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), deleteAction);
});
test('Kimi chooses the exact Delete item instead of a visible menu container containing its label', () => {
  const menuContainer = { hidden: false, textContent: '编辑标题 置顶 删除', getAttribute: () => null };
  const deleteAction = { hidden: false, textContent: '删除', getAttribute: () => null };
  const popup = { hidden: false, getAttribute: () => null, querySelectorAll: () => [menuContainer, deleteAction] };
  const fakeDocument = { querySelectorAll: (selector) => selector.includes('data-state="open"') ? [popup] : [] };
  const adapter = new KimiAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleMenuAction(), deleteAction);
});
test('Kimi finds the separate visible confirmation when its native modal has no semantic root', () => {
  const menuDelete = { hidden: false, textContent: '删除', getAttribute: () => null, contains: (node) => node === menuDelete };
  const confirmDelete = { hidden: false, textContent: '删除', getAttribute: () => null, contains: () => false };
  const fakeDocument = {
    querySelectorAll: (selector) => selector === 'button, [role="button"]' ? [menuDelete, confirmDelete] : []
  };
  const adapter = new KimiAdapter(fakeDocument, {});
  assert.equal(adapter.findVisibleConfirmation(menuDelete), confirmDelete);
});
