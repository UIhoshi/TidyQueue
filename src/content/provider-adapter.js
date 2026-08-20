(function (global) {
  function createProviderAdapter(documentRef = global.document, windowRef = global) {
    const hostname = windowRef?.location?.hostname || documentRef?.location?.hostname || global.location?.hostname;
    if (hostname === 'chatgpt.com' || hostname === 'chat.openai.com') return new global.ConversationAdapter(documentRef, windowRef);
    if (hostname === 'gemini.google.com') return new global.GeminiAdapter(documentRef, windowRef);
    if (hostname === 'copilot.com' || hostname === 'copilot.microsoft.com') return new global.CopilotAdapter(documentRef, windowRef);
    if (hostname === 'perplexity.ai' || hostname === 'www.perplexity.ai') return new global.PerplexityAdapter(documentRef, windowRef);
    if (hostname === 'kimi.com' || hostname === 'www.kimi.com') return new global.KimiAdapter(documentRef, windowRef);
    throw new Error(`Unsupported TidyQueue host: ${hostname || 'unknown'}`);
  }

  global.createProviderAdapter = createProviderAdapter;
  if (typeof module !== 'undefined') module.exports = { createProviderAdapter };
})(globalThis);
