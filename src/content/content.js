(function () {
  if (window.top !== window || window.__quickdelApp) return;

  const { t } = globalThis.quickdelI18n;
  const adapter = globalThis.createProviderAdapter();
  const state = { open: false, mode: 'visual', density: 3, theme: 'auto', query: '', age: 'all', items: [], selected: new Set(), selectionAnchorId: null, focusSearchOnOpen: false };
  const systemColorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  let fabDrag = null;
  let suppressFabClick = false;
  let rootHost;
  let shadow;
  let queue;
  let queueSafetyGuard;
  let pendingQueueSnapshot;
  let queueRenderFrame = 0;

  function createShell() {
    if (rootHost) return;
    rootHost = document.createElement('div');
    rootHost.id = 'quickdel-root';
    rootHost.style.cssText = 'all:initial;position:fixed;inset:0;z-index:2147483647;pointer-events:none';
    document.documentElement.append(rootHost);
    shadow = rootHost.attachShadow({ mode: 'closed' });
    shadow.innerHTML = `<style>${styles()}</style><div id="quickdel-layer" hidden></div><button id="qd-fab" type="button" aria-label="${escapeHtml(t('openControlCenter'))}"><span aria-hidden="true">◇</span><b>TidyQueue</b><i aria-hidden="true">⌃</i></button>`;
    shadow.addEventListener('click', handleClick);
    shadow.addEventListener('input', handleInput);
    shadow.addEventListener('keydown', handleKeydown);
    shadow.addEventListener('pointerdown', handlePointerDown);
    shadow.addEventListener('pointermove', handlePointerMove);
    shadow.addEventListener('pointerup', handlePointerUp);
  }

  function open() {
    createShell();
    state.items = adapter.list();
    state.selected = new Set();
    state.selectionAnchorId = null;
    state.open = true;
    state.focusSearchOnOpen = true;
    applyTheme();
    render();
  }

  function close() {
    state.open = false;
    queue?.stop();
    queueSafetyGuard?.stop();
    render();
  }

  function visibleItems() {
    const query = state.query.trim().toLocaleLowerCase();
    const limit = Number(state.age);
    return state.items.filter((item) => (!query || item.title.toLocaleLowerCase().includes(query)) && (!limit || (Number.isFinite(item.ageDays) && item.ageDays <= limit)));
  }

  function render() {
    if (!shadow) return;
    const layer = shadow.getElementById('quickdel-layer');
    const previousItems = shadow.querySelector('.qd-items');
    const previousScrollTop = previousItems?.scrollTop || 0;
    const focusedInputName = shadow.activeElement?.dataset?.input || null;
    const focusedSelectionStart = shadow.activeElement?.selectionStart;
    layer.hidden = !state.open;
    if (!state.open) { layer.innerHTML = ''; return; }
    const items = visibleItems();
    const selectionCount = state.selected.size;
    layer.innerHTML = `
      <section class="qd-shell qd-theme-${resolvedTheme()}" role="dialog" aria-modal="true" aria-labelledby="qd-title">
        <header class="qd-header">
          <div><p class="qd-eyebrow">TIDYQUEUE · ${escapeHtml(t('localOnly'))}</p><h1 id="qd-title">${escapeHtml(t('title'))}</h1></div>
          <button class="qd-icon" data-action="close" aria-label="${escapeHtml(t('close'))}">×</button>
        </header>
        <div class="qd-toolbar">
          <div class="qd-segment" role="group" aria-label="${escapeHtml(t('viewMode'))}">
            <button data-action="mode" data-mode="visual" aria-pressed="${state.mode === 'visual'}">▦ ${escapeHtml(t('visual'))}</button>
            <button data-action="mode" data-mode="list" aria-pressed="${state.mode === 'list'}">☷ ${escapeHtml(t('list'))}</button>
          </div>${state.mode === 'list' ? `<div class="qd-density" role="group" aria-label="${escapeHtml(t('listDensity'))}"><span>1–4</span>${[1, 2, 3, 4].map((density) => `<button data-action="density" data-density="${density}" aria-pressed="${state.density === density}">${density}</button>`).join('')}</div>` : ''}
          <label class="qd-search"><span class="qd-sr">${escapeHtml(t('search'))}</span><input data-input="query" value="${escapeHtml(state.query)}" placeholder="${escapeHtml(t('search'))}"></label>
          <select data-input="theme" aria-label="${escapeHtml(t('theme'))}"><option value="auto">${escapeHtml(t('themeAuto'))}</option><option value="dark">${escapeHtml(t('themeDark'))}</option><option value="light">${escapeHtml(t('themeLight'))}</option><option value="violet">${escapeHtml(t('themeViolet'))}</option></select>
          <select data-input="age" aria-label="${escapeHtml(t('ageFilter'))}">
            <option value="all">${escapeHtml(t('filterAll'))}</option><option value="7">${escapeHtml(t('filterWeek'))}</option><option value="30">${escapeHtml(t('filterMonth'))}</option><option value="90">${escapeHtml(t('filterQuarter'))}</option>
          </select>
          <span class="qd-count">${selectionCount} ${escapeHtml(t('selected'))}</span><span class="qd-selection-hint">${escapeHtml(t('selectionHint'))}</span>
        </div>
        <aside class="qd-load-notice" role="note"><span aria-hidden="true">⚠</span><div><strong>${escapeHtml(t('sidebarLoadHintTitle'))}</strong><p>${escapeHtml(t('sidebarLoadHint'))}</p></div></aside>
        <div class="qd-meta"><button class="qd-text" data-action="select-visible">${escapeHtml(t('selectAll'))}</button><button class="qd-text" data-action="clear">${escapeHtml(t('clear'))}</button><span>${items.length ? '' : escapeHtml(t('noConversations'))}</span></div>
        <main class="qd-items qd-${state.mode} qd-density-${state.density}">${items.length ? items.map(cardMarkup).join('') : `<p class="qd-empty">${escapeHtml(t('empty'))}</p>`}</main>
        <footer class="qd-footer"><span>${selectionCount} ${escapeHtml(t('selected'))}</span><button class="qd-primary" data-action="review" ${selectionCount ? '' : 'disabled'}>${escapeHtml(t('review'))} →</button></footer>
        <div id="qd-modal"></div>
      </section>`;
    shadow.querySelector('[data-input="age"]').value = state.age;
    shadow.querySelector('[data-input="theme"]').value = state.theme;
    shadow.querySelector('.qd-items').scrollTop = previousScrollTop;
    if (state.focusSearchOnOpen) { shadow.querySelector('[data-input="query"]').focus({ preventScroll: true }); state.focusSearchOnOpen = false; }
    else if (focusedInputName) {
      const input = shadow.querySelector(`[data-input="${focusedInputName}"]`);
      input?.focus({ preventScroll: true });
      if (typeof focusedSelectionStart === 'number') input?.setSelectionRange?.(focusedSelectionStart, focusedSelectionStart);
    }
  }

  function cardMarkup(item) {
    const selected = state.selected.has(item.id);
    const summary = item.title.length > 86 ? `${item.title.slice(0, 83)}…` : item.title;
    return `<article class="qd-card ${selected ? 'is-selected' : ''}" data-card-id="${escapeHtml(item.id)}" role="checkbox" aria-checked="${selected}" tabindex="0">
      <label><input type="checkbox" data-id="${escapeHtml(item.id)}" ${selected ? 'checked' : ''} aria-label="${escapeHtml(t('selectConversation', [item.title]))}"><span class="qd-check">✓</span></label>
      <div class="qd-orb" aria-hidden="true"></div><div class="qd-card-copy"><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(summary)}</p></div>
    </article>`;
  }

  function queueSlotMarkup() {
    return [0, 1, 2].map((index) => `<li class="qd-upcoming qd-queue-placeholder" data-queue-slot="${index}" aria-hidden="true"><b></b><span></span></li>`).join('');
  }

  function queueField(panel, name) { return panel.querySelector(`[data-queue="${name}"]`); }

  function ensureQueueModal() {
    const modal = shadow.getElementById('qd-modal');
    let panel = modal.querySelector('.qd-progress');
    if (panel) return panel;
    modal.innerHTML = `<div class="qd-backdrop"><section class="qd-modal qd-progress" data-queue-mode="live" role="dialog" aria-modal="true" aria-live="polite" aria-labelledby="qd-progress-title">
      <button class="qd-icon qd-modal-close" data-queue="review-close" data-action="dismiss-modal" aria-label="${escapeHtml(t('close'))}" hidden>×</button>
      <p class="qd-eyebrow" data-queue="eyebrow"></p><h2 id="qd-progress-title" data-queue="title"></h2><p class="qd-current" data-queue="current" aria-live="polite"></p>
      <div class="qd-progress-overview" role="progressbar" data-queue="progress" aria-valuemin="0">
        <div class="qd-progress-ring" aria-hidden="true"><svg viewBox="0 0 96 96"><circle class="qd-ring-track" cx="48" cy="48" r="40"></circle><circle class="qd-ring-value" data-queue="ring" cx="48" cy="48" r="40" style="stroke-dashoffset:251.33"></circle></svg><span><strong data-queue="completed">0</strong><small> / <i data-queue="total">0</i></small></span></div>
        <div class="qd-progress-copy"><p class="qd-progress-count" data-queue="count"></p><div class="qd-progress-bar" aria-hidden="true"><i data-queue="bar" style="width:0%"></i></div><p class="qd-progress-percent" data-queue="percent">0%</p></div>
      </div>
      <p class="qd-notice qd-notice-empty" data-queue="notice" aria-hidden="true"> </p><h3 data-queue="up-next"></h3><ol data-queue="list">${queueSlotMarkup()}</ol>
      <div class="qd-modal-actions"><button class="qd-secondary" data-queue="pause" data-action="pause"></button><button class="qd-primary" data-queue="resume" data-action="resume"></button><button class="qd-danger" data-queue="stop" data-action="stop"></button><button class="qd-primary" data-queue="finish" data-action="finish"></button><button class="qd-secondary" data-queue="cancel" data-action="dismiss-modal" hidden></button><button class="qd-danger" data-queue="confirm" data-action="confirm" hidden></button></div>
    </section></div>`;
    return modal.querySelector('.qd-progress');
  }

  function setQueueMode(panel, mode) {
    const isReview = mode === 'review';
    panel.dataset.queueMode = mode;
    panel.classList.toggle('qd-review-progress', isReview);
    panel.setAttribute('aria-live', isReview ? 'off' : 'polite');
    queueField(panel, 'review-close').hidden = !isReview;
    queueField(panel, 'cancel').hidden = !isReview;
    queueField(panel, 'confirm').hidden = !isReview;
    ['pause', 'resume', 'stop', 'finish'].forEach((name) => { queueField(panel, name).hidden = isReview; });
  }

  function ensureLiveQueueSlots(panel) {
    if (panel.dataset.queueMode === 'live' && panel.querySelector('[data-queue-slot="0"]')) return;
    setQueueMode(panel, 'live');
    const list = queueField(panel, 'list');
    list.className = '';
    list.innerHTML = queueSlotMarkup();
  }

  function showReview(reviewScrollTop = 0) {
    const selectedItems = state.items.filter((item) => state.selected.has(item.id));
    const modal = shadow.getElementById('qd-modal');
    if (!selectedItems.length) { modal.innerHTML = ''; render(); return; }
    const total = selectedItems.length;
    const panel = ensureQueueModal();
    setQueueMode(panel, 'review');
    panel.classList.remove('qd-has-error');
    const find = (name) => queueField(panel, name);
    find('eyebrow').textContent = `${total} ${t('selected')}`;
    find('title').textContent = t('readyToDelete');
    const current = find('current');
    current.dataset.value = '';
    current.textContent = ' ';
    current.classList.add('qd-current-placeholder');
    find('progress').setAttribute('aria-valuemax', String(total));
    find('progress').setAttribute('aria-valuenow', '0');
    find('progress').setAttribute('aria-label', t('progressLabel', ['0', String(total)]));
    find('ring').style.strokeDashoffset = '251.33';
    find('completed').textContent = '0';
    find('total').textContent = String(total);
    find('count').textContent = `0 ${t('completed')} · ${total} ${t('remaining')}`;
    find('bar').style.width = '0%';
    find('percent').textContent = '0%';
    const notice = find('notice');
    notice.classList.remove('qd-notice-empty');
    notice.classList.remove('qd-notice-error');
    notice.setAttribute('aria-hidden', 'false');
    notice.textContent = t('reviewBody');
    find('up-next').textContent = t('deletionQueue');
    const reviewList = find('list');
    reviewList.className = 'qd-review-list';
    reviewList.innerHTML = selectedItems.map((item, index) => `<li class="qd-upcoming qd-review-row"><b>${index + 1}</b><span>${escapeHtml(item.title)}</span><button class="qd-text" data-action="remove" data-id="${escapeHtml(item.id)}">${escapeHtml(t('remove'))}</button></li>`).join('');
    reviewList.scrollTop = reviewScrollTop;
    find('cancel').textContent = t('cancel');
    find('confirm').textContent = t('confirm');
    if (!reviewScrollTop) find('review-close').focus();
  }

  function animateQueueRow(row) {
    row.getAnimations?.().forEach((animation) => animation.cancel());
    if (!row.classList.contains('qd-queue-placeholder')) row.animate?.([
      { opacity: 0 }, { opacity: 1 }
    ], { duration: 180, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  function updateCurrentItem(node, value) {
    if (node.dataset.value === value) return;
    node.dataset.value = value;
    const transitionId = String((Number(node.dataset.transitionId) || 0) + 1);
    node.dataset.transitionId = transitionId;
    node.classList.add('qd-current-changing');
    window.setTimeout(() => {
      if (node.dataset.transitionId !== transitionId) return;
      node.textContent = value || ' ';
      node.classList.remove('qd-current-changing');
    }, 130);
  }

  function queueStateChanged(snapshot) {
    if (!state.open) return;
    pendingQueueSnapshot = snapshot;
    if (queueRenderFrame) return;
    queueRenderFrame = window.requestAnimationFrame(() => {
      queueRenderFrame = 0;
      const latestSnapshot = pendingQueueSnapshot;
      pendingQueueSnapshot = null;
      if (latestSnapshot && state.open) showQueue(latestSnapshot);
    });
  }

  function showQueue(snapshot) {
    const panel = ensureQueueModal();
    ensureLiveQueueSlots(panel);
    const current = snapshot.current;
    const progress = snapshot.total ? Math.round((snapshot.completed / snapshot.total) * 100) : 0;
    const ringOffset = (251.33 * (1 - progress / 100)).toFixed(2);
    const failureDetail = snapshot.pauseReason === 'failure' ? (snapshot.error || t('adapterError')) : '';
    const statusText = snapshot.status === 'completed' ? t('queueComplete') : snapshot.status === 'stopped' ? t('queueStopped') : snapshot.pauseReason === 'failure' ? failureDetail : snapshot.pauseReason === 'pacing' ? t('pacing') : snapshot.pauseReason === 'milestone' ? t('milestone', [String(snapshot.completed)]) : snapshot.pauseReason === 'page-change' ? t('pageChanged') : snapshot.pauseReason === 'tab-hidden' ? t('tabHidden') : '';
    const queueTitle = failureDetail ? t('failed') : snapshot.status === 'completed' || snapshot.status === 'stopped' ? statusText : snapshot.status === 'paused' ? t('paused') : t('deleting');
    const find = (name) => queueField(panel, name);
    find('eyebrow').textContent = snapshot.status === 'paused' ? t('paused') : t('deleting');
    find('title').textContent = queueTitle;
    find('current').classList.remove('qd-current-placeholder');
    updateCurrentItem(find('current'), current?.title || '');
    find('progress').setAttribute('aria-valuemax', String(snapshot.total));
    find('progress').setAttribute('aria-valuenow', String(snapshot.completed));
    find('progress').setAttribute('aria-label', t('progressLabel', [String(snapshot.completed), String(snapshot.total)]));
    find('ring').style.strokeDashoffset = ringOffset;
    find('completed').textContent = String(snapshot.completed);
    find('total').textContent = String(snapshot.total);
    find('count').textContent = `${snapshot.completed} ${t('completed')} · ${Math.max(0, snapshot.total - snapshot.completed)} ${t('remaining')}`;
    find('bar').style.width = `${progress}%`;
    find('percent').textContent = `${progress}%`;
    const notice = find('notice');
    panel.classList.toggle('qd-has-error', Boolean(failureDetail));
    notice.classList.toggle('qd-notice-error', Boolean(failureDetail));
    notice.classList.toggle('qd-notice-empty', !statusText);
    notice.setAttribute('aria-hidden', String(!statusText));
    notice.textContent = statusText || ' ';
    find('up-next').textContent = t('upNext');

    const sequenceStart = snapshot.completed + (current ? 2 : 1);
    [0, 1, 2].forEach((index) => {
      const row = panel.querySelector(`[data-queue-slot="${index}"]`);
      const item = snapshot.upcoming[index];
      const itemId = item?.id || '';
      const changed = row.dataset.itemId !== itemId;
      row.dataset.itemId = itemId;
      row.querySelector('b').textContent = String(sequenceStart + index);
      row.querySelector('span').textContent = item?.title || '';
      row.classList.toggle('qd-queue-placeholder', !item);
      row.setAttribute('aria-hidden', String(!item));
      if (item && changed) animateQueueRow(row);
    });

    const running = snapshot.status === 'running';
    const paused = snapshot.status === 'paused';
    find('pause').hidden = !running;
    find('resume').hidden = !paused;
    find('stop').hidden = !(running || paused);
    find('finish').hidden = running || paused;
    find('pause').textContent = t('pause');
    find('resume').textContent = t('resume');
    find('stop').textContent = t('stop');
    find('finish').textContent = t('close');
  }

  function startQueue() {
    const items = state.items.filter((item) => state.selected.has(item.id));
    queueSafetyGuard?.stop();
    queue = new globalThis.QueueController(async (item) => {
      const result = await adapter.deleteConversation(item);
      return result;
    }, {
      onChange: (snapshot) => {
        queueStateChanged(snapshot);
        if (snapshot.status === 'running') queueSafetyGuard?.start();
        else queueSafetyGuard?.stop();
      },
      milestoneEvery: 10,
      pauseDurationMs: 900,
      interItemDelayMs: 2000
    });
    queueSafetyGuard = new globalThis.QueueSafetyGuard(queue);
    queue.start(items);
  }

  function selectConversation(id, event = {}) {
    const visible = visibleItems();
    if (event.shiftKey && state.selectionAnchorId) {
      const anchorIndex = visible.findIndex((item) => item.id === state.selectionAnchorId);
      const targetIndex = visible.findIndex((item) => item.id === id);
      if (anchorIndex >= 0 && targetIndex >= 0) {
        const [start, end] = [anchorIndex, targetIndex].sort((a, b) => a - b);
        visible.slice(start, end + 1).forEach((item) => state.selected.add(item.id));
      }
    } else if (state.selected.has(id)) {
      state.selected.delete(id);
    } else {
      state.selected.add(id);
    }
    state.selectionAnchorId = id;
    render();
  }

  function handleClick(event) {
    const fab = event.target.closest('#qd-fab');
    if (fab) { if (!suppressFabClick) open(); return; }
    const checkbox = event.target.closest('input[type="checkbox"]');
    if (checkbox?.dataset.id) { event.stopPropagation(); selectConversation(checkbox.dataset.id, event); return; }
    const button = event.target.closest('button');
    if (button) {
      const action = button.dataset.action;
      if (action === 'close' || action === 'finish') close();
      if (action === 'mode') { state.mode = button.dataset.mode; render(); }
      if (action === 'density') { state.density = Number(button.dataset.density); render(); }
      if (action === 'select-visible') { visibleItems().forEach((item) => state.selected.add(item.id)); render(); }
      if (action === 'clear') { state.selected.clear(); state.selectionAnchorId = null; render(); }
      if (action === 'review') showReview();
      if (action === 'dismiss-modal') { shadow.getElementById('qd-modal').innerHTML = ''; render(); }
      if (action === 'remove') { const reviewScrollTop = shadow.querySelector('.qd-review-list')?.scrollTop || 0; state.selected.delete(button.dataset.id); showReview(reviewScrollTop); }
      if (action === 'confirm') startQueue();
      if (action === 'pause') queue?.pause('manual');
      if (action === 'resume') queue?.resume();
      if (action === 'stop') queue?.stop();
      return;
    }
    const card = event.target.closest('.qd-card');
    if (card?.dataset.cardId) selectConversation(card.dataset.cardId, event);
  }

  function handleInput(event) {
    if (event.target.dataset.input === 'query') { state.query = event.target.value; render(); }
    if (event.target.dataset.input === 'age') { state.age = event.target.value; render(); }
    if (event.target.dataset.input === 'theme') { state.theme = event.target.value; applyTheme(); render(); }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape') { const modal = shadow.getElementById('qd-modal'); const panel = modal.querySelector('.qd-progress'); if (panel?.dataset.queueMode === 'live' && ['running', 'paused'].includes(queue?.snapshot().status)) queue?.pause('manual'); else if (modal.innerHTML) { modal.innerHTML = ''; render(); } else close(); }
    const card = event.target.classList?.contains('qd-card') ? event.target : null;
    if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); selectConversation(card.dataset.cardId, event); }
  }

  function resolvedTheme() { return state.theme === 'auto' ? (systemColorScheme.matches ? 'dark' : 'light') : state.theme; }

  function applyTheme() {
    const fab = shadow?.getElementById('qd-fab');
    if (fab) fab.className = `qd-fab-${resolvedTheme()}`;
  }

  function handleOutsidePointerDown(event) {
    if (!state.open || !rootHost) return;
    const queueStatus = queue?.snapshot().status;
    if (queueStatus === 'running' || queueStatus === 'paused') return;
    const path = event.composedPath?.() || [];
    if (!path.includes(rootHost)) close();
  }

  function handlePointerDown(event) {
    const fab = event.target.closest('#qd-fab');
    if (!fab || event.button !== 0) return;
    const rect = fab.getBoundingClientRect();
    fabDrag = { element: fab, pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false };
    fab.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (!fabDrag || event.pointerId !== fabDrag.pointerId) return;
    const left = Math.max(12, Math.min(window.innerWidth - fabDrag.element.offsetWidth - 12, event.clientX - fabDrag.offsetX));
    const top = Math.max(12, Math.min(window.innerHeight - fabDrag.element.offsetHeight - 12, event.clientY - fabDrag.offsetY));
    if (Math.abs(event.movementX) > 1 || Math.abs(event.movementY) > 1) fabDrag.moved = true;
    if (fabDrag.moved) {
      fabDrag.element.style.left = `${left}px`;
      fabDrag.element.style.top = `${top}px`;
      fabDrag.element.style.right = 'auto';
      fabDrag.element.style.bottom = 'auto';
      event.preventDefault();
    }
  }

  function handlePointerUp(event) {
    if (!fabDrag || event.pointerId !== fabDrag.pointerId) return;
    fabDrag.element.releasePointerCapture?.(event.pointerId);
    if (fabDrag.moved) {
      suppressFabClick = true;
      window.setTimeout(() => { suppressFabClick = false; }, 0);
    }
    fabDrag = null;
  }
  function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

  document.addEventListener('pointerdown', handleOutsidePointerDown, true);
  chrome.runtime.onMessage.addListener((message) => { if (message?.type === 'quickdel:open') open(); });
  createShell();
  applyTheme();
  systemColorScheme.addEventListener?.('change', () => { if (state.theme === 'auto') { applyTheme(); if (state.open) render(); } });
  window.__quickdelApp = { open };

  function styles() { return `
    :host{all:initial}.qd-shell{pointer-events:auto;-webkit-user-select:none;user-select:none;position:absolute;inset:5vh max(18px,12vw);display:flex;flex-direction:column;max-height:90vh;color:#f7f7fb;background:rgba(15,16,26,.96);border:1px solid #393952;border-radius:22px;box-shadow:0 24px 80px rgba(0,0,0,.55);font:14px/1.4 Inter,ui-sans-serif,system-ui,sans-serif;overflow:hidden}.qd-header,.qd-toolbar,.qd-footer{display:flex;align-items:center;gap:14px}.qd-header{justify-content:space-between;padding:20px 24px 14px}.qd-eyebrow{margin:0 0 4px;color:#aa9dff;font-size:10px;font-weight:800;letter-spacing:.12em}.qd-header h1,.qd-modal h2{margin:0;font-size:23px;letter-spacing:-.03em}.qd-icon{border:0;border-radius:50%;width:32px;height:32px;background:#252637;color:#e8e7f4;font-size:22px;cursor:pointer}.qd-toolbar{padding:0 24px 10px;flex-wrap:wrap}.qd-segment{display:flex;padding:3px;background:#252637;border-radius:10px}.qd-segment button,.qd-text{border:0;background:transparent;color:#c9c7d6;cursor:pointer}.qd-segment button{padding:7px 9px;border-radius:7px}.qd-segment button[aria-pressed=true]{color:#fff;background:#5f50c8}.qd-density{display:flex;align-items:center;gap:4px;padding:3px 5px;border:1px solid #393a51;border-radius:9px;color:#aaa8bb;font-size:11px}.qd-density span{padding:0 4px}.qd-density button{border:0;border-radius:5px;min-width:25px;padding:4px 6px;background:transparent;color:#dedcea;cursor:pointer}.qd-density button[aria-pressed=true]{background:#574bb1;color:#fff}.qd-search{flex:1;min-width:180px}.qd-search input{-webkit-user-select:text;user-select:text}.qd-search input,select{box-sizing:border-box;width:100%;border:1px solid #424359;border-radius:9px;padding:9px 11px;background:#1a1b29;color:#f5f4fa}.qd-count{padding:8px 10px;border-radius:9px;background:#272345;color:#bfb5ff;font-weight:700;white-space:nowrap}.qd-selection-hint{color:#aaa7c3;font-size:12px;white-space:nowrap}.qd-load-notice{display:flex;align-items:flex-start;gap:10px;margin:0 24px 10px;padding:10px 12px;border:1px solid #8975ed;border-radius:11px;background:linear-gradient(90deg,#30265f,#242343);box-shadow:inset 3px 0 0 #a18cff;color:#eeecff}.qd-load-notice>span{font-size:16px;line-height:1.3}.qd-load-notice div{display:grid;min-width:0;gap:2px}.qd-load-notice strong{font-size:12px;letter-spacing:.01em}.qd-load-notice p{margin:0;color:#d5cfef;font-size:12px;line-height:1.35}.qd-meta{display:flex;align-items:center;gap:12px;min-height:22px;padding:0 24px 8px;color:#a9a8b8;flex-wrap:wrap}.qd-text{padding:0;color:#b8afff;text-decoration:underline;text-underline-offset:3px}.qd-items{display:grid;gap:10px;overflow:auto;padding:0 24px 18px}.qd-items.qd-visual{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}.qd-items.qd-list{grid-template-columns:1fr;gap:6px}.qd-items.qd-list.qd-density-2{grid-template-columns:repeat(2,minmax(0,1fr))}.qd-items.qd-list.qd-density-3{grid-template-columns:repeat(3,minmax(0,1fr))}.qd-items.qd-list.qd-density-4{grid-template-columns:repeat(4,minmax(0,1fr))}.qd-card{position:relative;display:flex;min-width:0;min-height:72px;gap:10px;padding:11px;border:1px solid #38394d;border-radius:11px;background:#20212e;cursor:pointer;overflow:hidden}.qd-list .qd-card{min-height:44px;padding:8px;gap:8px}.qd-list .qd-card .qd-orb{width:31px;height:31px}.qd-list .qd-card p{display:none}.qd-list .qd-card h2{display:block;overflow:hidden;padding-right:14px;font-size:12px;white-space:nowrap;text-overflow:ellipsis}.qd-card.is-selected{border-color:#7b6cf1;background:#252244;box-shadow:inset 0 0 0 1px #7b6cf1}.qd-card label{position:absolute;top:9px;right:9px;cursor:pointer}.qd-list .qd-card label{top:7px;right:7px}.qd-card input{position:absolute;opacity:0}.qd-check{display:grid;width:20px;height:20px;place-items:center;border:1px solid #7d7c92;border-radius:6px;color:transparent}.qd-card input:checked+.qd-check{border-color:#7665f4;background:#7665f4;color:#fff}.qd-card input:focus-visible+.qd-check,button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #c6beff;outline-offset:2px}.qd-orb{width:42px;height:42px;flex:none;border-radius:50%;background:conic-gradient(#bfb6a8,#404356,#e5dfd0,#242636,#bfb6a8)}.qd-card-copy{min-width:0;padding-right:18px}.qd-card h2{display:-webkit-box;margin:0;overflow:hidden;font-size:14px;line-height:1.3;-webkit-box-orient:vertical;-webkit-line-clamp:2}.qd-card p{display:-webkit-box;margin:4px 0 0;overflow:hidden;color:#b9b8c5;font-size:12px;-webkit-box-orient:vertical;-webkit-line-clamp:2}.qd-empty{grid-column:1/-1;color:#b9b8c5;text-align:center;padding:32px}.qd-footer{justify-content:space-between;margin-top:auto;padding:14px 24px;border-top:1px solid #35364a;color:#bbb9c6}.qd-primary,.qd-secondary,.qd-danger{border-radius:9px;padding:10px 14px;color:#fff;font:inherit;font-weight:750;cursor:pointer}.qd-primary{border:0;background:#6959dc}.qd-primary:disabled{cursor:not-allowed;opacity:.62}.qd-secondary{border:1px solid #5e5f75;background:#242535}.qd-danger{border:1px solid #db6479;background:transparent;color:#ffadba}.qd-backdrop{position:absolute;inset:0;display:grid;place-items:center;padding:18px;background:rgba(4,5,12,.54)}.qd-modal{position:relative;box-sizing:border-box;width:min(590px,100%);max-height:80vh;overflow:auto;padding:25px;border:1px solid #67618f;border-radius:18px;background:#171824;box-shadow:0 20px 60px #000}.qd-modal>p{color:#c4c2ce}.qd-modal-close{position:absolute;right:18px;top:16px}.qd-modal ul,.qd-modal ol{padding:0;margin:20px 0;list-style:none}.qd-modal li{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid #303142}.qd-modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.qd-progress-overview{display:flex;align-items:center;gap:16px;margin:16px 0}.qd-progress-ring{position:relative;display:grid;width:88px;height:88px;flex:none;place-items:center}.qd-progress-ring svg{width:88px;height:88px;transform:rotate(-90deg)}.qd-progress-ring circle{fill:none;stroke-width:8}.qd-ring-track{stroke:#343548}.qd-ring-value{stroke:#7764ef;stroke-linecap:round;stroke-dasharray:251.33;transition:stroke-dashoffset 1.35s cubic-bezier(.16,1,.3,1)}.qd-progress-ring span{position:absolute;color:#eeecff;font-variant-numeric:tabular-nums}.qd-progress-ring strong{font-size:24px;letter-spacing:-.06em}.qd-progress-ring small{color:#aaa7c3;font-size:12px}.qd-progress-copy{min-width:0;flex:1}.qd-progress-bar{height:9px;border-radius:99px;background:#313242;overflow:hidden}.qd-progress-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#8e7cff,#5c5ae7);transition:width .85s cubic-bezier(.16,1,.3,1)}.qd-progress-count,.qd-notice{color:#c7c4d2}.qd-progress-percent{margin:7px 0 0;color:#aaa7c3;font-size:12px;font-variant-numeric:tabular-nums}.qd-notice{box-sizing:border-box;height:40px;margin:0;padding:9px 11px;border-radius:9px;background:#292546;overflow:hidden;color:#c7c4d2;transition:opacity .2s ease}.qd-notice-error{height:64px;overflow:auto;white-space:normal;color:#8d263b;background:#fff1f3;border:1px solid #f3b6c1}.qd-notice-empty{visibility:hidden;opacity:0}.qd-progress{box-sizing:border-box;height:min(500px,calc(90vh - 36px));max-height:none;display:grid;grid-template-rows:18px 34px 22px 120px 40px 24px minmax(0,1fr) 42px;overflow:hidden}.qd-progress.qd-has-error{grid-template-rows:18px 34px 22px 120px 64px 24px minmax(0,1fr) 42px}.qd-progress .qd-eyebrow{align-self:start}.qd-progress h2{min-width:0;margin:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.qd-current{box-sizing:border-box;min-width:0;height:22px;margin:0;overflow:hidden;color:#aaa7c3;white-space:nowrap;text-overflow:ellipsis;opacity:1;transition:opacity .13s ease}.qd-current-placeholder{visibility:hidden}.qd-current-changing{opacity:0}.qd-progress-overview{align-self:center;margin:0}.qd-progress h3{align-self:end;margin:0;font-size:12px;color:#b8b4c5;text-transform:uppercase;letter-spacing:.08em}.qd-progress ol{display:flex;min-height:0;flex-direction:column;justify-content:flex-start;margin:0;overflow:auto;padding-right:4px}.qd-progress ol li{box-sizing:border-box;min-height:44px;flex:none;justify-content:flex-start;align-items:center}.qd-progress ol li b{display:grid;width:25px;height:25px;place-items:center;border-radius:50%;background:#2a2b3a}.qd-review-progress .qd-review-list{margin:0;overflow:auto;padding-right:4px}.qd-review-progress .qd-review-list .qd-review-row{flex:none}.qd-review-progress .qd-review-row span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.qd-review-progress .qd-review-row .qd-text{margin-left:auto;flex:none}.qd-queue-placeholder{visibility:hidden}.qd-progress .qd-modal-actions{align-self:end;display:flex;min-height:42px;margin:0}.qd-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}#qd-fab{pointer-events:auto;position:fixed;right:24px;bottom:24px;display:flex;align-items:center;gap:9px;border:1px solid #5c5784;border-radius:999px;padding:11px 14px;color:#f7f5ff;background:rgba(31,31,46,.96);box-shadow:0 12px 34px rgba(0,0,0,.4);font:700 13px/1 Inter,ui-sans-serif,system-ui,sans-serif;cursor:pointer}#qd-fab span{font-size:19px;color:#c3bbff}#qd-fab i{font-style:normal;color:#aaa7c3}#qd-fab:hover,#qd-fab:focus-visible{border-color:#a69aff;background:#39355e;outline:2px solid #c5bdff;outline-offset:2px}.qd-theme-light{color:#1d2030;background:#f7f8fc;border-color:#cbd0df;box-shadow:0 24px 80px rgba(38,45,72,.22)}.qd-theme-light .qd-card,.qd-theme-light .qd-modal{background:#fff;border-color:#cbd0df}.qd-theme-light .qd-card.is-selected{background:#eeecff;border-color:#7765e4}.qd-theme-light .qd-toolbar input,.qd-theme-light .qd-toolbar select{background:#fff;color:#232638;border-color:#bfc4d5}.qd-theme-light .qd-segment,.qd-theme-light .qd-secondary{background:#eceef5}.qd-theme-light .qd-segment button,.qd-theme-light .qd-text{color:#4b4a68}.qd-theme-light .qd-footer,.qd-theme-light .qd-meta,.qd-theme-light .qd-card p,.qd-theme-light .qd-progress-count{color:#575a6c}.qd-theme-light .qd-progress-bar{background:#dedfed}.qd-theme-light .qd-ring-track{stroke:#dedfed}.qd-theme-light .qd-progress-ring span{color:#24263a}.qd-theme-light .qd-icon{background:#e7e9f1;color:#2b2d3a}#qd-fab.qd-fab-light{color:#25263a;background:rgba(255,255,255,.96);border-color:#c4c8d7;box-shadow:0 12px 34px rgba(45,49,78,.2)}.qd-theme-violet{background:#1e1735;border-color:#7662bd;box-shadow:0 24px 80px rgba(45,22,88,.6)}.qd-theme-violet .qd-card{background:#2a2047;border-color:#554075}.qd-theme-violet .qd-card.is-selected{background:#3a2a67;border-color:#a38bff}.qd-theme-violet .qd-toolbar input,.qd-theme-violet .qd-toolbar select{background:#251b42;border-color:#5f4a88}.qd-theme-violet .qd-segment{background:#30224f}.qd-theme-violet .qd-progress-bar{background:#3f3165}.qd-theme-violet .qd-notice{background:#3a2d61}#qd-fab.qd-fab-violet{background:rgba(49,35,83,.97);border-color:#8c72d1}.qd-theme-dark{color:#f5f4fc;background:#141520;border-color:#43455d}.qd-theme-dark .qd-toolbar input,.qd-theme-dark .qd-toolbar select{border-color:#565a75}.qd-theme-dark .qd-secondary{border-color:#6a6e88;color:#f0eff8}.qd-theme-light{color:#1c2033;background:#f7f8fc;border-color:#c4cadb}.qd-theme-light .qd-card,.qd-theme-light .qd-modal{border-color:#c4cadb}.qd-theme-light .qd-toolbar input,.qd-theme-light .qd-toolbar select{color:#25293d;border-color:#9da8bf}.qd-theme-light .qd-segment,.qd-theme-light .qd-secondary{background:#eceef5}.qd-theme-light .qd-segment button,.qd-theme-light .qd-text{color:#343952}.qd-theme-light .qd-segment button[aria-pressed=true]{color:#fff;background:#5f50c8}.qd-theme-light .qd-density{border-color:#aeb7cb;background:#eef0f7;color:#525a74}.qd-theme-light .qd-density button{color:#343952}.qd-theme-light .qd-density button[aria-pressed=true]{color:#fff;background:#5f50c8}.qd-theme-light .qd-footer,.qd-theme-light .qd-meta,.qd-theme-light .qd-card p,.qd-theme-light .qd-progress-count{color:#4f566e}.qd-theme-light .qd-primary:disabled{opacity:1;border:1px solid #b6b1d4;background:#d9d7e8;color:#4c4b61}.qd-theme-violet{color:#f5f3ff;border-color:#836bc0}.qd-theme-violet .qd-toolbar input,.qd-theme-violet .qd-toolbar select{color:#f5f3ff;border-color:#765aa8}.qd-theme-violet .qd-density{border-color:#765aa8;color:#d7cfef}.qd-theme-violet .qd-density button{color:#ede9ff}.qd-theme-violet .qd-secondary{border-color:#8f7ac4;color:#f2efff}.qd-theme-violet .qd-meta,.qd-theme-violet .qd-card p,.qd-theme-violet .qd-progress-count{color:#d7cfef}@media(max-width:760px){.qd-shell{inset:12px}.qd-progress{height:min(500px,calc(90vh - 36px));min-height:0}.qd-items.qd-list.qd-density-3,.qd-items.qd-list.qd-density-4{grid-template-columns:repeat(2,minmax(0,1fr))}#qd-fab{right:15px;bottom:15px}.qd-toolbar{gap:8px}.qd-items.qd-visual{grid-template-columns:1fr}.qd-header,.qd-toolbar,.qd-footer,.qd-meta{padding-left:16px;padding-right:16px}.qd-load-notice{margin-left:16px;margin-right:16px}.qd-footer{flex-wrap:wrap}}
  `; }
})();
