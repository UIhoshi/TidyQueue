(function (global) {
  const CHATGPT_DELETE_LABELS = ['delete', '删除', 'eliminar', 'supprimer', 'löschen', '削除', '삭제', 'excluir', 'elimina'];
  const CHATGPT_MORE_LABELS = ['more', 'option', 'action', '更多', '选项', '操作', 'más', 'plus', 'mehr', 'その他', 'オプション', 'アクション', '더보기', 'mais', 'altro'];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const normalizedText = (node) => (node?.textContent || node?.getAttribute?.('aria-label') || node?.getAttribute?.('title') || '').trim().toLowerCase();
  const labelIncludes = (node, labels) => labels.some((label) => normalizedText(node).includes(label));

  function conversationIdFromHref(href, base = global.location?.origin || 'https://chatgpt.com') {
    try {
      const path = new URL(href, base).pathname;
      const match = path.match(/\/c\/([^/?#]+)/);
      return match?.[1] || null;
    } catch { return null; }
  }

  function inferRelativeAgeDays(link) {
    const patterns = [
      [/today|今天|今日|hoy|aujourd'hui|heute|今日|오늘|hoje|oggi/i, 0],
      [/yesterday|昨天|ayer|hier|gestern|昨日|어제|ontem|ieri/i, 1],
      [/(previous|last|past|最近|近|últim|dernier|letzten|過去|지난|últim|ultimi).{0,18}(7|七)/i, 7],
      [/(previous|last|past|最近|近|últim|dernier|letzten|過去|지난|últim|ultimi).{0,18}(30|三十)/i, 30],
      [/(previous|last|past|最近|近|últim|dernier|letzten|過去|지난|últim|ultimi).{0,18}(90|九十)/i, 90]
    ];
    let node = link.parentElement;
    for (let depth = 0; node && depth < 10; depth += 1, node = node.parentElement) {
      let sibling = node.previousElementSibling;
      for (let count = 0; sibling && count < 5; sibling = sibling.previousElementSibling, count += 1) {
        const text = (sibling.innerText || sibling.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length > 0 && text.length < 100) {
          const match = patterns.find(([pattern]) => pattern.test(text));
          if (match) return match[1];
        }
      }
    }
    return null;
  }

  function extractConversations(documentRef) {
    const byId = new Map();
    for (const link of documentRef.querySelectorAll('nav a[href*="/c/"], a[href*="/c/"]')) {
      const id = conversationIdFromHref(link.href, documentRef.location?.origin);
      const rawTitle = link.innerText || link.textContent || link.getAttribute?.('aria-label') || '';
      const title = rawTitle.replace(/\s+/g, ' ').trim();
      if (id && title && !byId.has(id)) byId.set(id, { id, href: link.href, title, ageDays: inferRelativeAgeDays(link), element: link });
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

  function menuActionMatcher(node, labels) {
    return isVisible(node) && (node?.getAttribute?.('data-color') === 'danger' && labelIncludes(node, labels) || labelIncludes(node, labels));
  }

  class ConversationAdapter {
    constructor(documentRef = document, windowRef = window) { this.document = documentRef; this.window = windowRef; }
    list() { return extractConversations(this.document); }
    findLink(id) { return this.list().find((item) => item.id === id)?.element || null; }

    async deleteConversation(item) {
      const link = await waitFor(() => this.findLink(item.id), 4000);
      if (!link) throw new Error('Conversation did not return to the sidebar after ChatGPT refreshed it.');
      const more = await waitFor(() => {
        const refreshedLink = this.findLink(item.id);
        if (!refreshedLink) return null;
        const container = this.closestActionContainer(refreshedLink);
        this.revealConversationActions(refreshedLink, container);
        return container ? this.findActionButton(container) : null;
      }, 2500);
      if (!more) throw new Error('Conversation action menu was not found for the selected sidebar item.');
      this.activateControl(more);

      const deleteAction = await waitFor(() => this.findVisibleMenuAction(CHATGPT_DELETE_LABELS), 2500);
      if (!deleteAction) throw new Error('Delete action was not found in the selected ChatGPT menu.');
      this.activateControl(deleteAction);

      const confirm = await waitFor(() => this.findVisibleConfirmation(CHATGPT_DELETE_LABELS), 2500);
      if (!confirm) throw new Error('Delete confirmation dialog was not found.');
      this.activateControl(confirm);

      // Do not serialize these two success signals. ChatGPT can retain a stale
      // sidebar link after a successful deletion, while the final confirmation closes
      // immediately. Whichever signal arrives first advances the queue.
      const outcome = await waitFor(() => {
        if (!this.findLink(item.id)) return { sidebarUpdated: true };
        if (!this.findVisibleConfirmation(CHATGPT_DELETE_LABELS)) return { sidebarUpdated: false, confirmationClosed: true };
        return null;
      }, 3500);
      if (outcome) return outcome;
      throw new Error('ChatGPT kept the deletion confirmation open and did not update the sidebar.');
    }

    activateControl(node) {
      if (!node) return;
      if (typeof PointerEvent === 'function') {
        node.dispatchEvent?.(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 }));
        node.dispatchEvent?.(new PointerEvent('pointerup', { bubbles: true, cancelable: true, button: 0 }));
      }
      if (typeof MouseEvent === 'function') {
        node.dispatchEvent?.(new MouseEvent('mousedown', { bubbles: true, cancelable: true, button: 0, view: this.window }));
        node.dispatchEvent?.(new MouseEvent('mouseup', { bubbles: true, cancelable: true, button: 0, view: this.window }));
      }
      node.click?.();
    }

    revealConversationActions(link, container) {
      const targets = new Set([link, link?.parentElement, container]);
      let cursor = link?.parentElement;
      for (let depth = 0; cursor && depth < 6; depth += 1, cursor = cursor.parentElement) targets.add(cursor);
      for (const node of targets) {
        if (!node) continue;
        if (typeof PointerEvent === 'function') {
          node.dispatchEvent?.(new PointerEvent('pointerenter', { bubbles: true, cancelable: true }));
          node.dispatchEvent?.(new PointerEvent('pointerover', { bubbles: true, cancelable: true }));
        }
        if (typeof MouseEvent === 'function') {
          for (const type of ['mouseover', 'mouseenter']) {
            node.dispatchEvent?.(new MouseEvent(type, { bubbles: true, cancelable: true, view: this.window }));
          }
        }
      }
    }

    closestActionContainer(link) {
      let node = link;
      for (let depth = 0; node && depth < 9; depth += 1, node = node.parentElement) {
        if (this.findActionButton(node)) return node;
      }
      const rowContainer = link?.closest?.('[data-sidebar-cycle-item], .sidebar-item, [data-sidebar-chatgpt-conversation-key], [role="listitem"], [role="group"], li');
      if (rowContainer) return rowContainer;
      return link?.parentElement || null;
    }

    findActionButton(container) {
      const buttons = [...(container?.querySelectorAll?.('button, [role="button"]') || [])];
      return buttons.find((button) => {
        if (!isVisible(button)) return false;
        if (button.getAttribute?.('aria-haspopup') === 'menu') return true;
        const testId = button.getAttribute?.('data-testid') || button.getAttribute?.('data-test-id') || '';
        return labelIncludes(button, CHATGPT_MORE_LABELS) || /(?:conversation|history).*(?:menu|option|action)|more|option/i.test(testId);
      }) || null;
    }

    findVisibleMenuAction(labels) {
      const menuRoots = [...this.document.querySelectorAll('[role="menu"], [data-radix-popper-content-wrapper], [data-radix-menu-content]')].filter(isVisible);
      const candidates = menuRoots.flatMap((root) => [...root.querySelectorAll('[role="menuitem"], [data-radix-collection-item], button, [role="button"]')]);
      return candidates.find((node) => menuActionMatcher(node, labels)) || null;
    }

    findVisibleConfirmation(labels) {
      const dialogs = [...this.document.querySelectorAll('[role="dialog"], [role="alertdialog"]')].filter(isVisible);
      for (const dialog of dialogs) {
        const button = [...dialog.querySelectorAll('button, [role="button"]')].find((node) => menuActionMatcher(node, labels));
        if (button) return button;
      }
      return null;
    }
  }

  global.ConversationAdapter = ConversationAdapter;
  global.quickdelAdapterHelpers = { conversationIdFromHref, inferRelativeAgeDays, extractConversations, isVisible };
  if (typeof module !== 'undefined') module.exports = { ConversationAdapter, conversationIdFromHref, inferRelativeAgeDays, extractConversations, isVisible };
})(globalThis);
