# Flows — Gemini Provider Adapter

## Open and review

Actor: signed-in Gemini user. Precondition: active `gemini.google.com/app` tab with the content
script loaded. The popup or launcher opens the unchanged UI; `GeminiAdapter.list()` returns only
visible `/app/<id>` conversations. The user selects items and explicitly confirms the existing
review queue. No write occurs before confirmation.

## Delete one conversation

Actor: confirmed queue. Precondition: selected Gemini sidebar row remains available. The adapter
reveals controls only on that row, opens its menu, finds a visible delete action, then finds a
visible delete confirmation dialog. It waits for row removal or confirmation closure before the
shared queue can advance. Missing controls, route changes, or hidden tabs pause the queue; no
next item begins.
