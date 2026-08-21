const status = document.getElementById('status');
const openButton = document.getElementById('open');
const message = (key, substitutions) => chrome.i18n.getMessage(key, substitutions) || key;

document.documentElement.lang = chrome.i18n.getUILanguage?.() || 'en';
document.querySelectorAll('[data-i18n]').forEach((element) => {
  element.textContent = message(element.dataset.i18n);
});

openButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url || '') && !/^https:\/\/gemini\.google\.com\/app(?:[/?#]|$)/.test(tab.url || '') && !/^https:\/\/(copilot\.com|copilot\.microsoft\.com|perplexity\.ai|www\.perplexity\.ai|kimi\.ai|www\.kimi\.ai)(?:[/?#]|$)/.test(tab.url || '')) {
    status.textContent = message('popupUnsupported');
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'quickdel:open' });
    window.close();
  } catch {
    status.textContent = message('popupReload');
  }
});
