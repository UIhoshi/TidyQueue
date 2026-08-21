(function (global) {
  const COPILOT_DELETE_LABELS = ['delete', '删除', 'eliminar', 'supprimer', 'löschen', '削除', '삭제', 'excluir', 'elimina'];
  const COPILOT_MORE_LABELS = ['more', 'option', 'menu', 'action', '更多', 'más', 'plus', 'mehr', 'その他', '더보기', 'mais', 'altro'];
  const COPILOT_LOAD_MORE_LABELS = ['show more', 'load more', 'more conversations', '显示更多', '加载更多', '显示更多对话', 'もっと表示', '더 보기', 'ver más', 'afficher plus', 'mehr anzeigen', 'mostrar mais', 'mostra altro'];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalizedText = (node) => (node?.textContent || node?.getAttribute?.('aria-label') || node?.getAttribute?.('title') || '').trim().toLowerCase();
  const labelIncludes = (node, labels) => labels.some((label) => normalizedText(node).includes(label));

  function copilotConversationIdFromHref(href, base = global.location?.origin || 'https://copilot.com') {
    try {
      const path = new URL(href, base).pathname;
      const match = path.match(/^\/(?:chats?|conversations)\/([^/?#]+)$/);
      return match?.[1] || null;
    } catch { return null; }
  }

  function copilotConversationIdFromElement(element, base = global.location?.origin || 'https://copilot.com') {
    const idFromHref = copilotConversationIdFromHref(element?.href, base);
    if (idFromHref) return idFromHref;
    const optionControl = element?.querySelector?.('[id^="conversation-options-"]');
    const optionId = optionControl?.id || optionControl?.getAttribute?.('id') || '';
    const match = optionId.match(/^conversation-options-(.+)$/);
    return match?.[1] || null;
  }

  function copilotConversationTitle(element) {
    const titleNode = element?.querySelector?.('p[title]');
    return (titleNode?.getAttribute?.('title') || titleNode?.textContent || element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function findScrollableAncestor(element) {
    let node = element?.parentElement || null;
    for (let depth = 0; node && depth < 12; depth += 1, node = node.parentElement) {
      if (Number(node.scrollHeight) > Number(node.clientHeight) + 1) return node;
    }
    return null;
  }

  function findScrollableAncestors(element) {
    const scrollers = [];
    let node = element?.parentElement || null;
    for (let depth = 0; node && depth < 12; depth += 1, node = node.parentElement) {
      if (Number(node.scrollHeight) > Number(node.clientHeight) + 1) scrollers.push(node);
    }
    return scrollers;
  }

  function findCopilotHistoryList(documentRef) {
    const lists = [...(documentRef.querySelectorAll?.('[role="list"]') || [])];
    return lists.find((list) => [...(list.querySelectorAll?.('[role="link"]') || [])].some((row) => copilotConversationIdFromElement(row, documentRef.location?.origin))) || null;
  }

  function extractCopilotConversations(documentRef) {
    const byId = new Map();
    const candidates = [
      ...documentRef.querySelectorAll('a[href]'),
      ...documentRef.querySelectorAll('[role="list"] [role="link"]')
    ];
    for (const element of candidates) {
      const id = copilotConversationIdFromElement(element, documentRef.location?.origin);
      const title = copilotConversationTitle(element);
      if (id && title && !byId.has(id)) byId.set(id, { id, href: element.href || null, title, ageDays: global.quickdelAdapterHelpers?.inferRelativeAgeDays?.(element) ?? null, element });
    }
    return [...byId.values()];
  }

  function isVisible(node) {
    if (!node || node.hidden || node.getAttribute?.('aria-hidden') === 'true') return false;
    const style = global.getComputedStyle?.(node);
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
  }

  function findLabeledAction(nodes, labels) {
    const visibleNodes = nodes.filter(isVisible);
    return visibleNodes.find((node) => labels.includes(normalizedText(node))) ||
      visibleNodes.find((node) => labelIncludes(node, labels)) || null;
  }

  function isMountedMenuNode(node) {
    if (!node || node.hidden || node.getAttribute?.('aria-hidden') === 'true') return false;
    const style = global.getComputedStyle?.(node);
    return !style || style.display !== 'none';
  }

  async function waitFor(predicate, timeoutMs = 4000, pollMs = 60) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const value = predicate();
      if (value) return value;
      await wait(pollMs);
    }
    return null;
  }

  class CopilotAdapter {
    constructor(documentRef = document, windowRef = window) { this.document = documentRef; this.window = windowRef; }
    list() { return extractCopilotConversations(this.document); }
    findLink(id) { return this.list().find((item) => item.id === id)?.element || null; }

    async prepareList({ maxSteps = 48, waitMs = 80 } = {}) {
      const historyList = findCopilotHistoryList(this.document);
      const rows = [...(historyList?.querySelectorAll?.('[role="link"]') || [])];
      const row = rows.find((candidate) => copilotConversationIdFromElement(candidate, this.document.location?.origin)) || this.list()[0]?.element;
      const scrollers = findScrollableAncestors(row);
      if (!historyList && !scrollers.length) return this.list();

      const originalScrollTops = scrollers.map((scroller) => [scroller, Number(scroller.scrollTop) || 0]);
      const originalWindowScrollY = Number(this.window?.scrollY) || 0;
      let stableBottomPasses = 0;
      for (let step = 0; step < maxSteps && stableBottomPasses < 3; step += 1) {
        const loadMore = this.findVisibleLoadMoreAction(historyList);
        if (loadMore) {
          loadMore.click();
          stableBottomPasses = 0;
          await wait(waitMs);
          continue;
        }
        if (!scrollers.length) break;
        const previousHeight = Math.max(...scrollers.map((scroller) => Number(scroller.scrollHeight) || 0));
        historyList?.lastElementChild?.scrollIntoView?.({ block: 'end', inline: 'nearest', behavior: 'instant' });
        for (const scroller of scrollers) {
          const viewport = Math.max(1, Number(scroller.clientHeight) || 0);
          const maximum = Math.max(0, (Number(scroller.scrollHeight) || 0) - viewport);
          scroller.scrollTop = Math.min(maximum, (Number(scroller.scrollTop) || 0) + Math.max(240, Math.floor(viewport * .9)));
        }
        await wait(waitMs);
        const currentHeight = Math.max(...scrollers.map((scroller) => Number(scroller.scrollHeight) || 0));
        const atBottom = scrollers.every((scroller) => (Number(scroller.scrollTop) || 0) >= Math.max(0, (Number(scroller.scrollHeight) || 0) - Math.max(1, Number(scroller.clientHeight) || 0) - 1));
        stableBottomPasses = atBottom && currentHeight <= previousHeight ? stableBottomPasses + 1 : 0;
      }
      if (scrollers.length) {
        for (const [scroller, scrollTop] of originalScrollTops.reverse()) scroller.scrollTop = scrollTop;
        this.window?.scrollTo?.({ top: originalWindowScrollY, behavior: 'instant' });
        await wait(waitMs);
      }
      return this.list();
    }

    findVisibleLoadMoreAction(historyList) {
      const buttons = [...(historyList?.querySelectorAll?.('button, [role="button"]') || [])];
      return buttons.find((button) => !button.disabled && isVisible(button) && labelIncludes(button, COPILOT_LOAD_MORE_LABELS)) || null;
    }

    async deleteConversation(item) {
      const link = await waitFor(() => this.findLink(item.id), 4000);
      if (!link) throw new Error('Copilot conversation did not return to the sidebar after it refreshed.');
      const more = await waitFor(() => {
        const refreshedLink = this.findLink(item.id);
        if (!refreshedLink) return null;
        this.revealConversationActions(refreshedLink, refreshedLink.parentElement);
        const container = this.findActionContainer(refreshedLink);
        return container ? this.findActionButton(container) : null;
      }, 2500);
      if (!more) throw new Error('Copilot conversation action menu was not found for the selected sidebar item.');
      more.click();

      const deleteAction = await waitFor(() => this.findVisibleMenuAction() || this.findSelectedHiddenMenuAction(item), 2500);
      if (!deleteAction) throw new Error('Copilot delete action was not found in the selected menu.');
      deleteAction.click();

      const confirm = await waitFor(() => this.findVisibleConfirmation(), 2500);
      if (!confirm) throw new Error('Copilot delete confirmation dialog was not found.');
      confirm.click();

      const outcome = await waitFor(() => {
        if (!this.findLink(item.id)) return { sidebarUpdated: true };
        if (!this.findVisibleConfirmation()) return { sidebarUpdated: false, confirmationClosed: true };
        return null;
      }, 3500);
      if (outcome) return outcome;
      throw new Error('Copilot kept the deletion confirmation open and did not update the sidebar.');
    }

    revealConversationActions(link, container) {
      for (const node of [link, container]) {
        if (!node) continue;
        for (const type of ['pointerover', 'mouseover', 'mouseenter']) {
          node.dispatchEvent?.(new MouseEvent(type, { bubbles: true, cancelable: true, view: this.window }));
        }
      }
    }

    findActionContainer(link) {
      let node = link;
      for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
        if (this.findActionButton(node)) return node;
      }
      return null;
    }

    findActionButton(container) {
      const providerOption = container?.querySelector?.('[id^="conversation-options-"]');
      if (isVisible(providerOption)) return providerOption;
      const buttons = [...(container?.querySelectorAll?.('button') || [])];
      return buttons.find((button) => {
        const testId = button.getAttribute?.('data-testid') || button.getAttribute?.('data-test-id') || '';
        return isVisible(button) && (labelIncludes(button, COPILOT_MORE_LABELS) || /(?:more|option|menu|action)/i.test(testId));
      }) || null;
    }

    findVisibleMenuAction() {
      const menuRoots = this.findMenuRoots(isVisible);
      const candidates = this.findMenuCandidates(menuRoots);
      return findLabeledAction(candidates, COPILOT_DELETE_LABELS);
    }

    findSelectedHiddenMenuAction(item) {
      const expectedTitle = (item?.title || '').replace(/\s+/g, ' ').trim();
      if (!expectedTitle) return null;
      const menuRoots = this.findMenuRoots(isMountedMenuNode);
      const candidates = this.findMenuCandidates(menuRoots).filter(isMountedMenuNode);
      return candidates.find((node) => {
        const actionTitle = (node.getAttribute?.('title') || '').replace(/\s+/g, ' ').trim();
        return actionTitle.includes(expectedTitle) && labelIncludes(node, COPILOT_DELETE_LABELS);
      }) || null;
    }

    findMenuRoots(visibilityFilter) {
      const menuRootSelector = '[role="menu"], [role="listbox"], [data-menu], [data-outside-events-ignore]';
      return [...this.document.querySelectorAll(menuRootSelector)].filter(visibilityFilter);
    }

    findMenuCandidates(menuRoots) {
      return menuRoots.flatMap((root) => [...root.querySelectorAll('[role="menuitem"], button, [role="button"], [tabindex]')]);
    }

    findVisibleConfirmation() {
      const dialogs = [...this.document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].filter(isVisible);
      for (const dialog of dialogs) {
        const button = [...dialog.querySelectorAll('button, [role="button"]')].find((node) => isVisible(node) && labelIncludes(node, COPILOT_DELETE_LABELS));
        if (button) return button;
      }
      return null;
    }
  }

  global.CopilotAdapter = CopilotAdapter;
  global.quickdelCopilotHelpers = { copilotConversationIdFromHref, copilotConversationIdFromElement, extractCopilotConversations, findCopilotHistoryList, findScrollableAncestor, findScrollableAncestors, isVisible };
  if (typeof module !== 'undefined') module.exports = { CopilotAdapter, copilotConversationIdFromHref, copilotConversationIdFromElement, extractCopilotConversations, findCopilotHistoryList, findScrollableAncestor, findScrollableAncestors, isVisible };
})(globalThis);
