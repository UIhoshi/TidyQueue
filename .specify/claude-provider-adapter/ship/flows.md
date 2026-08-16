# Flows — Claude Provider Adapter

## Discover and review
Actor: signed-in Claude user. Precondition: an active `claude.ai` tab with the content script loaded. The existing popup or launcher opens the unchanged UI; `ClaudeAdapter.list()` reads only unique titled standard `/chat/<id>` sidebar links currently present in the DOM. The user selects items, reviews the queue, and explicitly confirms.

## Delete one selected chat
Actor: confirmed queue. Precondition: selected Claude sidebar link is still available. The adapter re-finds and hovers that row, finds a visible row-owned more-actions control, and clicks Delete only within a visible menu. It clicks final Delete only within a visible dialog, then waits for sidebar removal or dialog closure. If any proof is missing, it throws; `QueueController` pauses before another item begins.

## Boundary checks
- browser → Claude DOM: current DOM only; no API request or persistent data.
- extension → destructive provider action: TidyQueue confirmation plus visible native dialog are both required.
- queue → next item: only observed success advances; route/tab safety guards remain active.
