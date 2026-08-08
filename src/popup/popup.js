const status = document.getElementById('status');
const openButton = document.getElementById('open');

openButton.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https:\/\/(chatgpt\.com|chat\.openai\.com)\//.test(tab.url || '')) {
    status.textContent = 'Open ChatGPT in this tab first.';
    return;
  }
  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'quickdel:open' });
    window.close();
  } catch {
    status.textContent = 'Reload this ChatGPT tab, then try again.';
  }
});