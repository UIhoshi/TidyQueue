(function (global) {
  const fallback = {
    extensionName: 'Quickdel', extensionDescription: 'Review and delete ChatGPT conversations locally.',
    title: 'Clean Queue', visual: 'Visual', list: 'List', search: 'Search conversations', selected: 'selected',
    selectAll: 'Select visible', clear: 'Clear selection', review: 'Review deletion', close: 'Close',
    noConversations: 'No sidebar conversations found. Refresh ChatGPT and try again.', reviewTitle: 'Review pending deletion',
    reviewBody: 'Nothing is deleted until you confirm.', readyToDelete: 'Ready to delete', deletionQueue: 'Deletion queue', remove: 'Remove', cancel: 'Cancel', confirm: 'Delete selected',
    deleting: 'Deleting now', upNext: 'Up next', completed: 'completed', remaining: 'remaining', pause: 'Pause', resume: 'Resume',
    stop: 'Stop & keep remaining', milestone: 'Brief pacing pause after {count}', paused: 'Paused', failed: 'Queue paused for review',
    filterAll: 'All time', filterWeek: 'Last 7 days', filterMonth: 'Last 30 days', filterQuarter: 'Last 90 days',
    unsupported: 'Quickdel only runs on ChatGPT.', retry: 'Try again', empty: 'No matching conversations.',
    previous: 'Previous', next: 'Next', queueStopped: 'Queue stopped. Remaining items were kept.',
    queueComplete: 'Queue complete.', pageChanged: 'Page changed; queue paused for safety.', tabHidden: 'Tab left; queue paused for safety.',
    adapterError: 'ChatGPT controls could not be confirmed. No further conversations were deleted.', theme: 'Theme', themeAuto: 'Auto', themeDark: 'Dark', themeLight: 'Light', themeViolet: 'Violet night', pacing: 'Safety pacing before the next conversation', localeFallback: 'en'
  };
  function message(key, substitutions) {
    const fromChrome = global.chrome?.i18n?.getMessage?.(key, substitutions);
    if (fromChrome) return fromChrome;
    let value = fallback[key] || key;
    if (Array.isArray(substitutions)) substitutions.forEach((item, index) => { value = value.replace(`{${index}}`, item); });
    return value;
  }
  global.quickdelI18n = { t: message, fallback };
})(globalThis);