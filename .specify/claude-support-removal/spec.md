# Specification — Claude Support Removal

## User decision

Claude now provides its own web bulk-deletion workflow. The user explicitly requested that
TidyQueue stop supporting Claude entirely rather than request the high-sensitivity Chrome
`debugger` permission needed to automate Claude's final native confirmation.

## Required behavior

- TidyQueue must not load on `claude.ai`, list Claude conversations, or offer Claude through the
  extension action.
- The Claude adapter and its tests must be removed.
- The remaining supported providers are ChatGPT, Gemini, Copilot, Perplexity, and Kimi; their
  existing UI, confirmation gate, local-only data handling, and adapter behavior do not change.
- The manifest and public/project documentation must no longer advertise Claude support.
- The extension keeps only the existing `activeTab` permission; it must not request `debugger`.

## Verification

- Regression tests prove that `claude.ai` is unsupported and that the remaining provider routes
  remain registered.
- Package validation rejects a manifest that still registers the Claude host or adapter source.
- `npm test`, `npm run package:check`, and a repository search confirm active product surfaces
  contain no Claude provider registration or support claim.
