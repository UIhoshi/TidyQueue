(function (global) {
  const fallback = {
    extensionName: 'TidyQueue', extensionDescription: 'Web AI Chat Cleanup',
    title: 'Clean Queue', visual: 'Visual', list: 'List', search: 'Search conversations', selected: 'selected',
    selectAll: 'Select visible', clear: 'Clear selection', review: 'Review deletion', close: 'Close',
    noConversations: 'No sidebar conversations found. Refresh the supported chat page and try again.', reviewTitle: 'Review pending deletion',
    reviewBody: 'Nothing is deleted until you confirm.', readyToDelete: 'Ready to delete', deletionQueue: 'Deletion queue', remove: 'Remove', cancel: 'Cancel', confirm: 'Delete selected',
    deleting: 'Deleting now', upNext: 'Up next', completed: 'completed', remaining: 'remaining', pause: 'Pause', resume: 'Resume',
    stop: 'Stop & keep remaining', milestone: 'Brief pacing pause after $1', paused: 'Paused', failed: 'Queue paused for review',
    filterAll: 'All time', filterWeek: 'Last 7 days', filterMonth: 'Last 30 days', filterQuarter: 'Last 90 days',
    unsupported: 'TidyQueue only runs on supported AI chat sites.', retry: 'Try again', empty: 'No matching conversations.',
    previous: 'Previous', next: 'Next', queueStopped: 'Queue stopped. Remaining items were kept.',
    queueComplete: 'Queue complete.', pageChanged: 'Page changed; queue paused for safety.', tabHidden: 'Tab left; queue paused for safety.',
    adapterError: "The provider's controls could not be confirmed. No further conversations were deleted.", theme: 'Theme', themeAuto: 'Auto', themeDark: 'Dark', themeLight: 'Light', themeViolet: 'Violet night', pacing: 'Safety pacing before the next conversation', localeFallback: 'en',
    openControlCenter: 'Open TidyQueue', localOnly: 'LOCAL ONLY', viewMode: 'View mode', listDensity: 'List density', ageFilter: 'Conversation age filter', selectConversation: 'Select $1', progressLabel: '$1 of $2 conversations completed',
    popupHeading: 'Review conversations first.', popupStatus: 'Open a supported AI chat tab, then launch the local control center.', popupOpen: 'Open control center', popupUnsupported: 'Open a supported AI chat in this tab first.', popupReload: 'Reload this supported chat tab, then try again.', selectionHint: 'Ctrl / Shift to select', sidebarLoadHintTitle: 'Load all conversations first', sidebarLoadHint: 'Before opening TidyQueue, scroll the conversation sidebar to the bottom to load all available chats.'
  };

  function message(key, substitutions) {
    const fromChrome = global.chrome?.i18n?.getMessage?.(key, substitutions);
    if (fromChrome) return fromChrome;
    let value = fallback[key] || key;
    if (Array.isArray(substitutions)) substitutions.forEach((item, index) => {
      const replacement = String(item);
      value = value.replaceAll(String.fromCharCode(36) + (index + 1), replacement).replaceAll('{' + index + '}', replacement);
    });
    return value;
  }

  global.quickdelI18n = { t: message, fallback };
})(globalThis);
