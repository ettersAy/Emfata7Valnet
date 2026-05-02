# Reflection: Inline Credential Editor

## Navigation & Discovery
- `src/popup/popup-main.js` is the central wiring file — all event listeners, bootstrap, and inline editor functions live here
- `popup-dom.js` handles all DOM element creation (site rows, credential pairs, inline editor)
- `popup-dialog.js` was dual-purpose (add + edit) — had to carefully keep edit flow intact while removing add flow
- i18n keys are all in `src/common/i18n.js` — adding a new key requires 6-language translation

## Time Waste / Confusion
- Empty state handling was tricky: when list is empty and inline editor shows, the empty state div stays underneath and looks wrong — had to add `data-was-empty` tracking to hide/restore it
- `popup-drag.js` uses `closest(".site-row")` — the inline editor has class `site-row--editor` which matches `.site-row` CSS selector, but lacks `draggable` attribute so drag doesn't fire. Had to verify this doesn't break drag behavior
- `popup-events.js` `onListClick` handler matches `closest(".site-row")` — the editor matches but has no `dataset.websiteId`, so the function exits early. No harmful side effects but needed verification

## Assumptions That Were Incorrect
- Assumed `prepend` to empty list wouldn't need empty state handling — actually empty state is a child div that stays visible underneath the editor
- Assumed i18n `t()` function would gracefully return a fallback for missing keys — it returns the key itself, not a nice string. Had to add `savedSuccess` translation

## Repeated Actions
- Read the same files multiple times due to editor diff truncation (`[outdated - see the latest file content]`) — had to use full `filesystem__read_text_file` to get the complete current state
- Re-read `popup-events.js` multiple times to verify `.site-row` selector matching wouldn't conflict with the editor

## Missing Knowledge
- The `popup-main.js` file had all the import + wiring + function definitions — no separation between wiring and business logic
- No documented convention for when to use dialog vs inline for CRUD operations
- The drag-and-drop system's reliance on `.site-row` CSS class means ANY element with that class in the list gets drag behavior unless explicitly prevented

## Automation Opportunities
- Adding i18n keys requires manually writing 6 translations — could use a snippet/template
- Verifying drag compatibility with new card types requires checking `popup-drag.js` — no automated way to detect conflicts
