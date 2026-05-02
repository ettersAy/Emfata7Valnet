# Problem
Event handlers in `popup-events.js` are wired in `wireEvents()` but only to `siteList`. Events on children outside `siteList` (like `#minimizedList`) require separate listeners. This is not documented and caused a missed listener in this mission.

# Improvement Needed
Document in `popup-events.js` or a brief architecture note that event listeners must be explicitly attached to each DOM container, and that delegation does not cross container boundaries.

# Expected Result
Future AI agents will immediately know to add separate listeners for separate containers.
