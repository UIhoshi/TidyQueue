# Derived Tests — Multi-Provider Adapters

| Intended behavior | Existing proof | Remaining gap |
| --- | --- | --- |
| Each new host selects only its matching adapter | Router unit tests | None for static registration |
| Only ordinary conversation paths are listed | Route/extraction unit tests reject project, space, collection, and blank/duplicate cases | Live route shape can change |
| Destructive controls are visible and row-scoped | Visible-menu/dialog and action-container unit tests | Real provider DOM semantics need manual verification |
| No privilege expansion | Manifest/package test confirms `activeTab` and explicit host matches | None for manifest content |
| Existing UI remains structurally unchanged | Existing localization/layout-source regression tests | Logged-in visual check remains manual |
| A real deletion is safe | Existing review/queue guards plus fail-closed adapter paths | One disposable logged-in Chrome deletion per new provider is required |