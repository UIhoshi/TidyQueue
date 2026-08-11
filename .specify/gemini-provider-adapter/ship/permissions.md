# Permissions — Gemini Provider Adapter

- `activeTab`: used after the user activates TidyQueue to address the current supported tab.
- Content-script host matches: `chatgpt.com`, `chat.openai.com`, and `gemini.google.com/app`.
- No Chrome storage, history, identity, cookie, network, download, or broad tab permission.

Deletion is authorized only by the user's existing provider session, TidyQueue's review
confirmation, and the provider's visible native confirmation dialog.
