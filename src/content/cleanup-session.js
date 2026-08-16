(function (global) {
  function refreshBatchState(state, items) {
    state.items = Array.isArray(items) ? items : [];
    state.selected = new Set();
    state.selectionAnchorId = null;
    return state;
  }

  global.quickdelSession = { refreshBatchState };
  if (typeof module !== 'undefined') module.exports = { refreshBatchState };
})(globalThis);
