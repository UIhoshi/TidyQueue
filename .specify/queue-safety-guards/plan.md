# Plan — Active Queue Safety Guards

## Approach

Add a small testable `QueueSafetyGuard` module that receives the active queue, the current URL,
and document visibility. It records the route at queue start, observes route changes through
navigation events plus a bounded polling fallback for SPA history changes, and pauses a running
queue with the appropriate existing reason. `content.js` will start and stop that guard around
the queue lifecycle. The manifest and package check will register the new source file.

## Red-Team Results

1. **Fails if SPA navigation changes URL without emitting `popstate`.** High impact, medium
   likelihood, cheap to test. Mitigation: combine browser events with a short URL polling check.
2. **Fails if an inactive/finished queue is paused by a stale listener.** Medium impact, medium
   likelihood, cheap to test. Mitigation: guard only pauses `running` queues and dispose all
   listeners/timers when lifecycle ends.
3. **Fails if the monitor leaks across reopening the panel.** Medium impact, medium likelihood,
   cheap to test. Mitigation: make `start()` idempotently reset prior monitoring and always call
   `stop()` from close and queue terminal callbacks.
4. **Fails if navigation occurs during a destructive action and another item starts.** Critical
   impact, medium likelihood, cheap to test. Mitigation: pause immediately; QueueController's
   run token prevents the pump from advancing to another item after the in-flight adapter call.

## Validation

- Add Node unit tests for route and hidden-tab pauses.
- Run `npm test` and `npm run package:check`.
- Leave logged-in ChatGPT browser verification explicitly pending.
