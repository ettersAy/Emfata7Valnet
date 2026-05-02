# Reflection: Inline Credentials + Minimize

## Discovery & Navigation
- `.cred-wrap` CSS class was easy to find via search across 24 files
- `popup-dom.js`, `popup.css`, `popup-events.js`, `popup-state.js` all located quickly — folder structure is clear (`src/popup/`)
- i18n keys are centralized in `src/common/i18n.js` with 6-language support — easy to extend
- RTL support via `[dir="rtl"]` CSS overrides — need to remember `margin-inline-start` instead of `margin-left`

## Time Waste / Confusion
- Double-click event on minimized list items would not fire because `wireEvents()` only attaches to `siteList` — needed to add separate listener for `#minimizedList`
- `handleRestore` was written but unused — restore logic ended up directly in `onListDblClick`
- `getDisplayUrl` import was initially missing from `popup-events.js` — had to add in a second edit pass

## Assumptions That Were Incorrect
- Assumed double-click on items in a separate `<section>` would bubble to `siteList` listener — events don't cross container boundaries via delegation
- Assumed `gh` CLI was fast enough — it timed out at 30s. Fall back to GitHub MCP tool first next time

## Repeated Actions
- Multiple `read_files` calls with stale cached output (`[outdated - see the latest file content]`) — had to re-read same files using full path without line ranges
- Had to search for `getDisplayUrl` export to confirm it existed after adding the import

## Missing Knowledge
- No `.clinerules` file exists to document project conventions
- No architecture doc for event delegation pattern in `popup-events.js`
- RTL handling patterns not documented
