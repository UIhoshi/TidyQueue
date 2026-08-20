const test = require('node:test');
const assert = require('node:assert/strict');
const { CopilotAdapter, copilotConversationIdFromHref, extractCopilotConversations } = require('../src/content/copilot-adapter.js');
const { PerplexityAdapter, perplexityConversationIdFromHref, extractPerplexityConversations } = require('../src/content/perplexity-adapter.js');
const { KimiAdapter, kimiConversationIdFromHref, extractKimiConversations } = require('../src/content/kimi-adapter.js');

const providerCases = [
  {
    name: 'Copilot',
    Adapter: CopilotAdapter,
    idFromHref: copilotConversationIdFromHref,
    extract: extractCopilotConversations,
    accepted: 'https://copilot.com/chats/first',
    excluded: ['https://copilot.com/chats', 'https://copilot.com/chat/first', 'https://copilot.com/projects/project-1'],
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
    accepted: 'https://www.kimi.com/chat/first',
    excluded: ['https://www.kimi.com/chat', 'https://www.kimi.com/project/project-1/chat/first', 'https://www.kimi.com/projects/project-1'],
    duplicate: 'https://www.kimi.com/chat/first',
    second: 'https://www.kimi.com/chat/second'
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
