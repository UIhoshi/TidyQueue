# UI Theme Readability Plan

## Approach
1. Refine only the CSS emitted by `styles()` in `src/content/content.js`; retain all markup, event handling, state, layout geometry, and deletion behavior.
2. Add explicit light-theme overrides for segmented and density controls so active white-on-indigo and inactive dark-on-light states do not inherit conflicting colors.
3. Strengthen secondary text, border, focus, selected, and disabled-state contrast across the existing Dark, Light, and Violet Night themes; Auto inherits its existing resolved theme behavior.
4. Validate syntax, unit tests, package structure, and CSS-token expectations. Then visually inspect the reloaded extension in a logged-in ChatGPT tab.

## Constraints
- No layout, spacing, card-density, interaction, permission, localization, or deletion-flow changes.
- No new font, runtime dependency, external asset, or stored data.
- Keep the explicit fixed review footer from the preceding isolated fix.

## Red-Team Results

| Ranked risk | Fails if… | Mitigation / test |
| --- | --- | --- |
| 1 | a later light-theme selector overrides selected control text and creates low contrast again. | Add a more specific active-control override and assert it exists in the CSS source. |
| 2 | contrast changes alter layout or card sizing. | Change only color, font, border, outline, and opacity declarations; inspect the diff for geometry changes. |
| 3 | disabled actions become unreadable after opacity is retained. | Set an explicit light-theme disabled treatment and visually inspect it. |
| 4 | a theme-specific override reduces dark or violet contrast. | Preserve the base dark palette; add narrow overrides and manually inspect every theme. |

## Verification
- `node --check src/content/content.js`
- `npm test`
- `npm run package:check`
- Static source checks for the required theme-state rules
- Logged-in ChatGPT visual verification after content-script reload (all four themes, selected and disabled states)
