# TidyQueue

TidyQueue is a local-only Chrome Manifest V3 extension that injects a reviewed bulk-delete control center into a visible ChatGPT web tab.

## Load locally in Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this project folder.
4. Open `https://chatgpt.com`, then click the TidyQueue extension icon.

## Safety model

- It has no backend, analytics, account system, or Chrome storage permission.
- Conversation titles and selection state exist only in memory while the current tab stays open.
- Deletion requires the extension's review-and-confirm step.
- The DOM adapter pauses on missing or changed ChatGPT controls; it does not continue after uncertainty.

## Privacy

Read the [TidyQueue Privacy Policy](./PRIVACY_POLICY.md).

## Validate

```powershell
npm test
npm run package:check
```

Before real use, test with a disposable conversation in a logged-in ChatGPT tab. ChatGPT's DOM can change, so the selector adapter needs browser validation after ChatGPT UI changes.
