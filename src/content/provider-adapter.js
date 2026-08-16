(function (global) {
  function createProviderAdapter(documentRef = global.document, windowRef = global) {
    const hostname = windowRef?.location?.hostname || documentRef?.location?.hostname || global.location?.hostname;
    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') return new global.ConversationAdapter(documentRef, windowRef);
    if (hostname === 'gemini.google.com') return new global.GeminiAdapter(documentRef, windowRef);
    if (hostname === 'claude.ai') return new global.ClaudeAdapter(documentRef, windowRef);
    throw new Error(`Unsupported TidyQueue host: ${hostname || 'unknown'}`);
  }

  global.createProviderAdapter = createProviderAdapter;
  if (typeof module !== 'undefined') module.exports = { createProviderAdapter };
})(globalThis);
