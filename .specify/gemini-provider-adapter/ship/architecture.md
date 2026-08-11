# Architecture — Gemini Provider Adapter

TidyQueue remains a local-only MV3 extension with one unchanged Shadow-DOM UI and one shared
`QueueController`. `provider-adapter.js` routes only supported hosts to provider-specific DOM
adapters: the existing ChatGPT adapter or the new Gemini adapter. Gemini support adds no backend,
storage, identity, analytics, or new extension permission.

## Trust boundaries and risks

- Browser page → provider DOM adapter: all destructive selectors are provider-specific and must
  fail closed when controls cannot be proven visible.
- Adapter → native provider dialog: TidyQueue requires its own review confirmation before clicking
  the provider's visible native delete confirmation.
- Known risk: Gemini's authenticated DOM can change; static tests cannot verify it. Manual
  disposable-chat validation is required before release use.

## Related documents

- [Flows](./flows.md)
- [Permissions](./permissions.md)
- [Variables](./variables.md)
- [Tests](./tests.md)
