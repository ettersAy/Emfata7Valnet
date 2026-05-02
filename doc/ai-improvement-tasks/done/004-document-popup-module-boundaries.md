# Document Popup Module Boundaries

## Problem

The popup module has multiple files with overlapping responsibilities (`popup-main.js`, `popup-events.js`, `popup-dom.js`, `popup-dialog.js`, `popup-drag.js`, `popup-render.js`, `popup-state.js`, `popup-vault.js`, `popup-collapse.js`) but no documented boundaries for when to use inline editing vs dialog editing vs direct DOM manipulation. New card types (like the inline editor) can silently break drag-and-drop or event delegation because they share CSS class selectors.

## Files & Their Responsibilities

### `src/popup/popup-main.js` — **Orchestrator / Entry Point**
- **Role**: Bootstrap sequence, imports all module `init*` functions, wires top-level events (lock/unlock, add site button, inline editor save/cancel, password strength meter).
- **Owns**: The `dom` reference object that is passed to all other modules.
- **Owns**: `loadAndRender()` — the function that loads websites from storage, sorts them, resets search, then calls `renderWebsites()`.
- **Owns**: `showInlineEditor()`, `hideInlineEditor()`, `saveFromInlineEditor()` — inline editor lifecycle.
- **Sequence**: `initI18n()` → `initVault()` → `initDialog()` → `initEvents()` → `initDrag()` → `initCollapse()` → `bootstrap()` → top-level event wiring.

### `src/popup/popup-state.js` — **Shared State**
- **Role**: Exports a mutable `popupState` singleton and `filteredWebsites()` helper.
- **Properties**: `websites[]`, `editWebsiteId`, `searchQuery`, `collapsed`, `_toastTimer`.
- **Usage**: Imported by almost every other module — **changes must be coordinated**.

### `src/popup/popup-dom.js` — **DOM Element Factory**
- **Role**: Pure element creation functions. No side effects, no event wiring.
- **Exports**: `createSiteRow()`, `createCredentialPair()`, `clearElement()`, `createEmptyState()`, `createInlineEditor()`.
- **CSS Selectors used**: `.site-row`, `.drag-handle`, `.site-head`, `.open-site`, `.edit-site`, `.delete-site`, `.minimize-site`, `.cred-wrap`, `.cred-pair`, `.cred-pair__login`, `.cred-pair__lock`, `.cred-pair__fill`, `.empty-state`, `.empty-state__icon`, `.site-row--editor`, `.inline-editor` element IDs (`#inlineEditor`, `#inlineSiteUrl`, `#inlineLogin`, `#inlinePassword`).
- **Constraint**: `createInlineEditor()` also pre-fills site URL from the active tab.

### `src/popup/popup-render.js` — **Rendering Orchestrator**
- **Role**: Calls `clearElement()` + `createSiteRow()` / `createEmptyState()` from `popup-dom.js`, handles decryption of logins for display.
- **Exports**: `renderWebsites()`, `updateEntryCount()`, `showToast()`.
- **Constraint**: Must be called after any data mutation to refresh the UI.

### `src/popup/popup-events.js` — **Event Delegation & Actions**
- **Role**: Attaches event listeners to containers (`#websiteList`, `#minimizedList`, `#searchInput`), handles click/dblclick delegation.
- **Exports**: `initEvents(refs)`.
- **CSS Selectors used (as `event.target.closest()` queries)**: `.site-row`, `.open-site`, `.edit-site`, `.delete-site`, `.cred-pair__lock`, `.cred-pair__fill`, `.minimize-site`, `.minimized-site`, `.cred-pair__login`.
- **Key constraint**: Event delegation is **container-scoped**. Events from `#minimizedList` do NOT bubble to `#websiteList` listeners. Every container needs its own `.addEventListener()` call.
- **Dynamic import**: `onListDblClick()` uses dynamic `import()` for `popup-render.js` and `popup-state.js` when restoring minimized chips.

### `src/popup/popup-dialog.js` — **Dialog CRUD (Edit/Add via <dialog>)**
- **Role**: Manages the `<dialog id="siteDialog">` lifecycle — opening for edit/add, form submission with credential pair management.
- **Exports**: `initDialog(refs)`, `openDialog(website?)`, `closeDialog()`, `onSubmit(event)`.
- **Owns**: `addCredentialPair()`, `getCredentialPairsFromDialog()`.
- **CSS Selectors used**: `.credential-pair-fields`, `.remove-cred-btn`, `.toggle-pass-btn`, `.password-input-wrap`, `.cred-login-input`, `.cred-password-input`.
- **Constraint**: Uses the `#credentialPairTemplate` `<template>` element for cloning dialog rows.

### `src/popup/popup-drag.js` — **Drag-and-Drop Reordering**
- **Role**: Attaches `dragstart`/`dragover`/`drop`/`dragend` to `#websiteList` only.
- **Exports**: `initDrag(refs)`.
- **CSS Selectors used**: `.site-row` (for closest lookup), `.dragging` (class toggle).
- **Critical**: The inline editor has class `.site-row--editor` and also `.site-row` — this means drag events can fire on it. The `onDragStart()` function checks for `.site-row` via `closest()`. If the inline editor is being dragged, it will be treated like a site row. This is a **known conflict**.

### `src/popup/popup-vault.js` — **Vault Gate (Lock/Unlock)**
- **Role**: Master password setup, daily session unlock, vault lock.
- **Exports**: `initVault(refs)`, `trySessionAutoUnlock()`, `bootstrapVaultGate()`, `handleUnlock()`, `lockVault()`.
- **Owns**: `#vaultGate` section — shown when locked, hidden when unlocked.

### `src/popup/popup-collapse.js` — **Collapse/Expand List**
- **Role**: Hides `#websiteList` + `#searchBar`, shows `#expandListBtn` floating button.
- **Exports**: `initCollapse(refs)`, `collapse()`, `expand()`, `toggleCollapse()`.

---

## Sequence of Operations in `popup-main.js`

```
await initI18n()                          // 1. Load translations first
    ↓
initVault(dom)                            // 2. Initialize vault module (stores dom refs)
initDialog(dom)                           // 3. Initialize dialog module (stores dom refs, wires dialog events)
initEvents(dom)                           // 4. Initialize event delegation (stores dom refs, wires list/search events)
initDrag(dom)                             // 5. Initialize drag-and-drop (stores dom refs, wires drag events)
initCollapse(dom)                         // 6. Initialize collapse/expand (stores dom refs, wires expand button)
    ↓
Wire top-level events:                    // 7. Wire unlock, lock, addSite, settings, inline editor events
- unlockBtn.click → handleUnlock()
- lockVaultBtn.click → lockVault()
- addSiteBtn.click → showInlineEditor()
- openSettingsBtn.click → chrome.runtime.openOptionsPage()
- cancelBtn.click → closeDialog()
- siteForm.submit → onSubmit()
- inlineSaveBtn.click → saveFromInlineEditor()
- inlineCancelBtn.click → hideInlineEditor()
- togglePassBtn.click → toggle vault password visibility
- masterPasswordInput.input → evaluateStrength()
- siteList.dblclick → collapseList() (on empty space)
    ↓
await bootstrap()                         // 8. Bootstrap vault gate
    ├─ bootstrapVaultGate()               //    - Show configured vs new user hint
    └─ trySessionAutoUnlock()?            //    - Attempt daily session unlock
         ├─ YES → loadAndRender()         //      → Load websites, sort, render
         └─ NO  → Show vault gate         //      → Show locked screen
```

---

## CRUD Flow Conventions

### Creating a new entry → Use **Inline Editor**
- **Trigger**: Clicking `#addSiteBtn` in the header.
- **Flow**: `popup-main.js:showInlineEditor()` → calls `popup-dom.js:createInlineEditor()` → appends `#inlineEditor` to `#websiteList` → user fills fields → `popup-main.js:saveFromInlineEditor()` encrypts, stores, re-renders.
- **Why inline**: Fast single-credential entry. No dialog modal overhead. Pre-fills site URL from active tab.
- **Limitation**: Only supports creating **a single credential** per site. No multi-credential addition.

### Editing an existing entry → Use **Dialog**
- **Trigger**: Clicking `.edit-site` button on a site row.
- **Flow**: `popup-events.js:onListClick()` → calls `popup-dialog.js:openDialog(website)` → shows `<dialog id="siteDialog">` with pre-filled form → user edits → `popup-dialog.js:onSubmit()` → preserves existing encrypted data for fields left as `••••••` → saves → re-renders.
- **Why dialog**: Supports multiple credentials per site, preserves encrypted data without re-encrypting, uses `<template>` for dynamic credential pair rows.
- **Also used for**: Adding multiple credentials at once (even though "Add" button triggers inline editor, the dialog can be used to add a site with multiple credentials if needed).

### Deleting an entry → Use **Button Action**
- **Trigger**: Clicking `.delete-site` button on a site row.
- **Flow**: `popup-events.js:onListClick()` → filters website out of array → saves → re-renders.
- **No confirmation dialog** — deletion is immediate with a toast notification.

### Minimizing an entry → Use **Button Action**
- **Trigger**: Clicking `.minimize-site` button on a site row.
- **Flow**: `popup-events.js:handleMinimize()` → creates a `.minimized-site` chip in `#minimizedList` → removes `.site-row` from `#websiteList`.
- **Restore**: Double-click on `.minimized-site` chip → `popup-events.js:onListDblClick()` → re-renders everything.

### When to add a new interactive card type (guidelines):
1. **If it needs inline add + single credential**: Extend the inline editor in `popup-main.js` and `popup-dom.js`.
2. **If it needs edit with multi-credential support**: Add to the dialog in `popup-dialog.js`.
3. **If it needs a new action button on the row**: Add the button element in `popup-dom.js:createSiteRow()`, add the CSS class in the CSS file, add the handler in `popup-events.js:onListClick()`.
4. **If it's drag-able**: Make sure it doesn't share the `.site-row` class unless it should be draggable. The inline editor uses `.site-row--editor` alongside `.site-row` — this is a **drag conflict**.

---

## Shared CSS Class Selectors & Cross-Module Dependencies

| CSS Selector | Used by Modules | Purpose |
|---|---|---|
| `.site-row` | `popup-dom.js` (creates), `popup-drag.js` (drag target), `popup-events.js` (click/dblclick target), `popup.css` (styles) | Main card container |
| `.site-row--editor` | `popup-dom.js` (inline editor), `popup.css` (styles) | Editor variant — shares `.site-row` base class |
| `.open-site` | `popup-dom.js` (creates), `popup-events.js` (click → open tab, dblclick → copy URL) | Site title/link |
| `.edit-site` | `popup-dom.js` (creates), `popup-events.js` (click → openDialog) | Edit button |
| `.delete-site` | `popup-dom.js` (creates), `popup-events.js` (click → delete) | Delete button |
| `.minimize-site` | `popup-dom.js` (creates), `popup-events.js` (click → minimize) | Minimize button |
| `.cred-pair` | `popup-dom.js` (creates), `popup-events.js` (lock/fill/click), `popup.css` (styles) | Credential display row |
| `.cred-pair__lock` | `popup-dom.js` (creates), `popup-events.js` (click → toggle reveal), `popup.css` (styles) | Toggle password visibility |
| `.cred-pair__fill` | `popup-dom.js` (creates), `popup-events.js` (click → autofill), `popup.css` (styles) | Auto-fill button |
| `.cred-pair__login` | `popup-dom.js` (creates), `popup-events.js` (dblclick → copy), `popup.css` (styles) | Login display text |
| `.drag-handle` | `popup-dom.js` (creates), `popup.css` (styles) | Drag grip handle |
| `.dragging` | `popup-drag.js` (toggles), `popup.css` (styles) | Drag state indicator |
| `.empty-state` | `popup-dom.js` (creates), `popup-main.js` (hides/shows during inline edit) | Empty list placeholder |
| `.minimized-site` | `popup-events.js` (creates, dblclick → restore), `popup.css` (styles) | Minimized chip |
| `.credential-pair-fields` | `popup-dialog.js` (creates from template, collects data) | Dialog credential rows |
| `.cred-login-input` / `.cred-password-input` | `popup-dialog.js` (read values) | Dialog input fields |
| `.copy-indicator` | `popup-events.js` (creates), `popup.css` (styles) | "Copied!" tooltip |
| `.site-head` | `popup-dom.js` (creates), `popup.css` (styles) | Row header container |

**Critical conflicts to watch for:**

1. **`.site-row` class sharing**: The inline editor (`#inlineEditor`) has class `site-row site-row--editor`. This means:
   - Drag events (`popup-drag.js`) will fire on the inline editor via `.site-row` closest lookup.
   - Click events (`popup-events.js`) will also fire on the inline editor.
   - Currently, `onDragStart()` checks if the target has `.site-row` and allows drag — the inline editor can accidentally be dragged.
   - This works today because the inline editor inputs swallow events before they bubble to the list, but it's fragile.

2. **`.empty-state` hiding during inline edit**: `popup-main.js:showInlineEditor()` hides `.empty-state` and restores it in `hideInlineEditor()`. If another module removes/re-adds the empty state, this state management breaks.

3. **`.minimized-site` via `onListDblClick`**: The `popup-events.js` attaches `dblclick` to both `#websiteList` and `#minimizedList`. The `onListDblClick()` handler checks for `.minimized-site` FIRST (before `.open-site`), so minimized chips don't conflict with the URL copy behavior.

---

## Modules Requiring Verification When Adding New Interactive Card Types

When adding a new type of card/interactive element to the popup, verify these modules in order:

### 1. `popup-dom.js` — Element Creation
- Add a new element factory function (or extend `createSiteRow()`).
- Use unique class names following BEM convention: `.component__element--modifier`.
- **Avoid** reusing generic classes like `.icon-btn` for anything that needs specific event handling.

### 2. `popup.css` — Styles
- Add CSS for the new element.
- Ensure **BEM naming** to avoid selector conflicts.
- Check if any existing styles for `.site-row`, `.cred-pair`, `.icon-btn`, `.site-head` would accidentally apply.

### 3. `popup-events.js` — Event Handlers
- If the new element is inside `#websiteList`, add a new `event.target.closest()` check in `onListClick()` or `onListDblClick()`.
- If the new element is in a **separate container** (like `#minimizedList` is separate from `#websiteList`), attach a new `addEventListener()` call in `wireEvents()`.
- **Never** assume events bubble across sibling containers.

### 4. `popup-drag.js` — Drag Compatibility
- If the new element has class `.site-row` (or is inside one), verify it won't break drag-and-drop.
- If the new element should NOT be draggable, use `e.preventDefault()` in the drag handler or avoid assigning `.site-row` class.
- Currently, the only guard is `e.target.closest(".site-row")` — if the element itself is a `.site-row`, it will be draggable.

### 5. `popup-dialog.js` — Dialog Integration
- If the new card type needs editing with multiple credentials, use the dialog.
- If it's a simple single-credential add, use the inline editor in `popup-main.js`.
- **No new dialog types should be created** — extend the existing `<dialog id="siteDialog">`.

### 6. `popup-state.js` — State Changes
- If the new card type needs new state properties, add them to `popupState`.
- Be aware that `filteredWebsites()` is used by both `popup-events.js` and `popup-dialog.js` and `popup-main.js`.

### 7. `popup-render.js` — Re-rendering
- After any data mutation (create, update, delete, reorder), call `renderWebsites()` + `updateEntryCount()`.
- `renderWebsites()` wipes all children of the root element — any non-site-row elements (like the inline editor) that were prepended will be lost unless they are moved back to a stable parent first (which `hideInlineEditor()` does).

### 8. `popup-collapse.js` — Collapse State
- When collapsed, `#websiteList` and `#searchBar` are hidden, and `#expandListBtn` is shown.
- Any new interactive element that lives inside `#websiteList` will be hidden when collapsed — this may or may not be desired.
- If the new element should remain visible when collapsed, place it outside `#websiteList` in `popup.html` and manage its visibility independently.

---

## Verification Checklist for New Card Types

- [ ] Does it use **unique CSS class names** (BEM convention)?
- [ ] Does it avoid sharing `.site-row` class unless it's a draggable card?
- [ ] Does it have proper **event delegation** (`.closest()` in `popup-events.js`)?
- [ ] If in a **new container**, does `wireEvents()` have a dedicated `.addEventListener()` for it?
- [ ] Does it **not break drag-and-drop** (verify with `popup-drag.js`)?
- [ ] Does it handle **empty state** conflicts (`.empty-state` visibility)?
- [ ] Does it handle **collapse state** correctly (hidden when collapsed, or independently visible)?
- [ ] Does it properly **clean up** when re-rendering (e.g., moving inline editor back to stable parent)?
- [ ] Are **keyboard interactions** handled (Enter, Escape) if it contains inputs?
