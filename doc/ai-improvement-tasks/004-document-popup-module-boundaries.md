# Problem
The popup module has multiple files with overlapping responsibilities (`popup-main.js`, `popup-events.js`, `popup-dom.js`, `popup-dialog.js`, `popup-drag.js`) but no documented boundaries for when to use inline editing vs dialog editing vs direct DOM manipulation. New card types (like the inline editor) can silently break drag-and-drop or event delegation because they share CSS class selectors.

# Improvement Needed
Document the CRUD flow conventions:
- When to use dialogs vs inline editors
- What CSS class selectors are shared between drag, events, and rendering modules
- Which modules need verification when adding new interactive card types
- The sequence of operations in `popup-main.js` (bootstrap → init → wire → render)

# Expected Result
Future AI agents adding new UI elements to the popup will know which modules to check for conflicts without scanning all files manually.
