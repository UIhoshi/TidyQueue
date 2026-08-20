(function (global) {
  const PERPLEXITY_DELETE_LABELS = ['delete', '删除', 'eliminar', 'supprimer', 'löschen', '削除', '삭제', 'excluir', 'elimina'];
  const PERPLEXITY_MORE_LABELS = ['more', 'option', 'menu', 'action', '更多', 'más', 'plus', 'mehr', 'その他', '더보기', 'mais', 'altro'];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalizedText = (node) => (node?.textContent || node?.getAttribute?.('aria-label') || node?.getAttribute?.('title') || '').trim().toLowerCase();
  const labelIncludes = (node, labels) => labels.some((label) => normalizedText(node).includes(label));

  function perplexityConversationIdFromHref(href, base = global.location?.origin || 'https://www.perplexity.ai') {
    try {
      const path = new URL(href, base).pathname;
      const match = path.match(/^\/search\/([^/?#]+)$/);
      return match?.[1] || null;
    } catch { return null; }
  }

  function extractPerplexityConversations(documentRef) {
    const byId = new Map();
    for (const link of documentRef.querySelectorAll('a[href*="/search/"]')) {
      const id = perplexityConversationIdFromHref(link.href, documentRef.location?.origin);
      const title = (link.innerText || link.textContent || '').replace(/\s+/g, ' ').trim();
      if (id && title && !byId.has(id)) byId.set(id, { id, href: link.href, title, ageDays: global.quickdelAdapterHelpers?.inferRelativeAgeDays?.(link) ?? null, element: link });
    }
    return [...byId.values()];
  }

  function isVisible(node) {
    if (!node || node.hidden || node.getAttribute?.('aria-hidden') === 'true') return false;
    const style = global.getComputedStyle?.(node);
    return !style || (style.display !== 'none' && style.visibility !== 'hidden');
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

  class PerplexityAdapter {
    constructor(documentRef = document, windowRef = window) { this.document = documentRef; this.window = windowRef; }
    list() { return extractPerplexityConversations(this.document); }
    findLink(id) { return this.list().find((item) => item.id === id)?.element || null; }

    async deleteConversation(item) {
      const link = await waitFor(() => this.findLink(item.id), 4000);
      if (!link) throw new Error('Perplexity conversation did not return to the sidebar after it refreshed.');
      const more = await waitFor(() => {
        const refreshedLink = this.findLink(item.id);
        if (!refreshedLink) return null;
        this.revealConversationActions(refreshedLink, refreshedLink.parentElement);
        const container = this.findActionContainer(refreshedLink);
        return container ? this.findActionButton(container) : null;
      }, 2500);
      if (!more) throw new Error('Perplexity conversation action menu was not found for the selected sidebar item.');
      more.click();

      const deleteAction = await waitFor(() => this.findVisibleMenuAction(), 2500);
      if (!deleteAction) throw new Error('Perplexity delete action was not found in the selected menu.');
      deleteAction.click();

      const confirm = await waitFor(() => this.findVisibleConfirmation(), 2500);
      if (!confirm) throw new Error('Perplexity delete confirmation dialog was not found.');
      confirm.click();

      const outcome = await waitFor(() => {
        if (!this.findLink(item.id)) return { sidebarUpdated: true };
        if (!this.findVisibleConfirmation()) return { sidebarUpdated: false, confirmationClosed: true };
        return null;
      }, 3500);
      if (outcome) return outcome;
      throw new Error('Perplexity kept the deletion confirmation open and did not update the sidebar.');
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
      let node = link.parentElement;
      for (let depth = 0; node && depth < 6; depth += 1, node = node.parentElement) {
        if (this.findActionButton(node)) return node;
      }
      return null;
    }

    findActionButton(container) {
      const buttons = [...(container?.querySelectorAll?.('button') || [])];
      return buttons.find((button) => {
        const testId = button.getAttribute?.('data-testid') || button.getAttribute?.('data-test-id') || '';
        return isVisible(button) && (labelIncludes(button, PERPLEXITY_MORE_LABELS) || /(?:more|option|menu|action)/i.test(testId));
      }) || null;
    }

    findVisibleMenuAction() {
      const menuRoots = [...this.document.querySelectorAll('[role="menu"], [role="listbox"], [data-menu]')].filter(isVisible);
      const candidates = menuRoots.flatMap((root) => [...root.querySelectorAll('[role="menuitem"], button, [role="button"]')]);
      return candidates.find((node) => isVisible(node) && labelIncludes(node, PERPLEXITY_DELETE_LABELS)) || null;
    }

    findVisibleConfirmation() {
      const dialogs = [...this.document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].filter(isVisible);
      for (const dialog of dialogs) {
        const button = [...dialog.querySelectorAll('button, [role="button"]')].find((node) => isVisible(node) && labelIncludes(node, PERPLEXITY_DELETE_LABELS));
        if (button) return button;
      }
      return null;
    }
  }

  global.PerplexityAdapter = PerplexityAdapter;
  global.quickdelPerplexityHelpers = { perplexityConversationIdFromHref, extractPerplexityConversations, isVisible };
  if (typeof module !== 'undefined') module.exports = { PerplexityAdapter, perplexityConversationIdFromHref, extractPerplexityConversations, isVisible };
})(globalThis);