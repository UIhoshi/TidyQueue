# Constitution

1. Destructive actions must be explicit, visible, cancellable, and fail closed.
2. Conversation metadata and pending deletion state stay in memory in the active tab only.
3. Prefer standard Chrome and DOM APIs over dependencies.
4. Every UI control must have a keyboard-accessible native control and visible focus style.
5. ChatGPT DOM integration is treated as an adapter boundary: selector mismatch pauses the queue rather than guessing.