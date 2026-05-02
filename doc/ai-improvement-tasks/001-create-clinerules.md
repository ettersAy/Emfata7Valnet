# Problem
No `.clinerules` file exists. Future AI agents must rediscover project conventions (branch naming, CSS patterns, i18n structure, event delegation patterns) by scanning files.

# Improvement Needed
Create a `.clinerules` file documenting:
- Branch naming convention (feat/, fix/)
- CSS class naming conventions (BEM-like)
- i18n key structure and translation file location
- Event delegation pattern (popup-events.js wireEvents)
- RTL support requirements (margin-inline-start, [dir="rtl"] overrides)

# Expected Result
Future AI agents can follow documented conventions without guessing or scanning for patterns.
