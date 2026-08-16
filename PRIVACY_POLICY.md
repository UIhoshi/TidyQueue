# TidyQueue Privacy Policy

**Effective date:** August 8, 2026

TidyQueue is a local-only Chrome extension that helps users review, filter, and delete their own supported AI-chat conversations after explicit confirmation.

## Data handling

TidyQueue does not collect, sell, share, transmit, or store personal information on any remote server. It has no backend service, analytics, advertising SDK, account system, telemetry, or third-party data processor.

While the extension is open on an eligible ChatGPT, Gemini, or Claude page, it processes only the information needed to provide its local controls:

- visible sidebar conversation titles and conversation URLs/identifiers;
- date-group labels used for the optional conversation-age filter; and
- the user's current selection, display preferences, and deletion-queue state.

This information remains in the current browser tab's memory only. It is not written to Chrome storage, browser storage, files, or a remote database, and it is discarded when the relevant page session ends.

TidyQueue does not read or send supported-provider message content to a server.

## Permissions

TidyQueue requests only the permissions required for its single purpose:

- **`activeTab`** is used after the user clicks the extension action to check whether the active tab is an eligible supported chat page and to open the local control center there.
- **Host access for `chatgpt.com`, `chat.openai.com`, `gemini.google.com/app`, and `claude.ai`** is used to load the local interface, read the visible conversation sidebar, and perform an explicitly confirmed deletion through the user's existing provider session.

The extension does not request access to browsing history, downloads, cookies, identity information, clipboard data, or data on unrelated websites.

## User control and deletion

Conversation deletion is initiated only after the user reviews the selected conversations and explicitly confirms deletion. TidyQueue does not delete conversations automatically. Deletions are performed through the user's existing provider session and are governed by the applicable provider service behavior and policies.

## Third-party services

TidyQueue does not use third-party analytics, advertising, payment, cloud-storage, or data-processing services. It does not transfer extension data to any third party.

## Changes to this policy

If TidyQueue's data practices change, this policy will be updated before the changed version is released.

## Contact

For privacy questions or concerns, please open an issue in the project repository: <https://github.com/UIhoshi/TidyQueue/issues>.
