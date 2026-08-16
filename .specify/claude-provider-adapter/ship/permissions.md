# Permissions — Claude Provider Adapter

- Manifest permissions remain exactly `activeTab`.
- Content-script matches include `https://claude.ai/*` in addition to the existing ChatGPT and Gemini hosts.
- No `host_permissions`, storage, identity, history, network, analytics, or remote service is added.
- Deletion remains explicit, user-reviewed, and visible in the signed-in browser tab.
