# Plan — Kimi International Domain Switch

1. Replace only the Kimi host registrations in the manifest, popup host predicate, provider router,
   package validator, and existing regression fixtures. Keep the adapter's fail-closed destructive
   flow and route shape unchanged.
2. Update public support/privacy wording, release metadata, and project maps so the shipped host
   scope is reviewable and contains no stale Kimi China host claim.
3. Run the full Node test suite, package validation, and a repository-wide active-reference audit.
   Record the remaining logged-in Kimi AI browser verification gap.

## Red-Team Results

1. **Fails if `kimi.com` remains in any active host surface.** It could inject the extension on a
   non-target site. Mitigation: assert the Kimi AI host pair is present and the Kimi China pair is
   absent in unit/package checks, then audit active references.
2. **Fails if `kimi.ai` loads the content script but the popup or router rejects it.** The extension
   would appear broken. Mitigation: align manifest, popup predicate, and adapter-factory assertions.
3. **Fails if international Kimi's URL or deletion DOM differs from the old adapter assumptions.**
   A destructive operation could not safely proceed. Mitigation: preserve narrow `/chat/<id>`
   filtering and visible-menu/dialog guards; the adapter fails closed and manual logged-in browser
   validation remains explicitly pending.
4. **Fails if the host-scope switch broadens permissions or weakens confirmation.** Mitigation:
   retain the exact `activeTab` permission and no queue/UI behavior changes; test the permission
   invariant.
5. **Fails if documentation advertises the wrong host.** Mitigation: update README, privacy policy,
   project map, and code map in the same change and search for stale active references.
