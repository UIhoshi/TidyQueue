# Tasks — Copilot and Kimi Adapter Recovery

- [x] Add the Kimi open-popup deletion-menu fallback and its regression coverage.
- [x] Add Copilot ordinary-chat route aliases and negative discovery coverage for Library, Projects,
  and group-join paths.
- [x] Add Copilot floating-menu and Kimi non-semantic-confirmation regression coverage.
- [x] Prioritize Kimi's exact visible `删除` menu item over an enclosing menu container whose text
  also includes `删除`.
- [x] Add bounded Copilot lazy-history loading, including its scoped **Show more** path, that
  restores the prior sidebar scroll position.
- [x] Cover nested Copilot scroll ancestors and native sentinel visibility so the provider's
  intersection-based loader runs without a manual sidebar scroll.
- [x] Use the user-captured localized Copilot menu contract to recognize its exact focusable
  non-button delete action without clicking a text-containing menu wrapper.
- [x] Handle Copilot's mounted `visibility:hidden` menu only when its delete action title identifies
  the selected conversation, with regression coverage for rejecting another conversation's command.
- [x] Update project maps and the error log with the observed failure boundary and manual checks.
- [x] Run `npm test` and `npm run package:check`.
- [x] Reload the unpacked extension and manually verify ordinary-conversation deletion in logged-in
  Copilot and Kimi AI tabs. The user confirmed both flows work after the latest reload.
