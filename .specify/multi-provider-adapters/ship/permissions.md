# Permissions — Multi-Provider Adapters

- Chrome permission remains exactly `activeTab`.
- Content scripts run only on explicit HTTPS matches for the six supported provider families; this change adds Copilot, Perplexity, and Kimi hosts only.
- The adapters use no cookies, identity APIs, storage, network requests, or provider APIs.
- Deletion still requires the user’s existing provider session and TidyQueue’s explicit review confirmation.