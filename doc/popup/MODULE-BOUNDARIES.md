# Popup Module Boundaries Reference

> **Target**: Future AI agents adding new UI elements to the popup.
> **Goal**: Know which modules to check for conflicts without scanning all files manually.

## File Inventory (`src/popup/`)

| File | Role | Exports Called by `popup-main.js` |
|------|------|----------------------------------|
| `popup-main.js` | Bootstrap, orchestrator, inline editor UI logic | Entry point (no exports) |
| `popup-state.js` | Mutable singleton state + filtered helper | `popupState`, `filteredWebsites()` |
| `popup-dom.js` | DOM element factories | `createSiteRow`, `createCredentialPair`, `clearElement`, `createEmptyState`, `createInlineEditor` |
| `popup-render.js` | Rendering loop, toast, entry count | `renderWebsites`, `updateEntryCount`, `showToast` |
| `popup-events.js` | Event delegation for list interactions | `initEvents` |
| `popup-dialog.js` | Modal dialog for editing entries | `initDialog`, `openDialog`, `closeDialog`, `onSubmit` |
| `popup-drag.js` | Drag-and-drop reordering | `initDrag` |
| `popup-collapse.js` | Collapse/expand the site list | `initCollapse`, `collapse` |
| `popup-vault.js` | Vault unlock/lock, session management | `initVault`, `trySessionAutoUnlock`, `bootstrapVaultGate`, `handleUnlock`, `lockVault` |

## Module Dependency Graph

```
popup-main.js
 ├── popup-state.js           (state singleton — no deps)
 ├── popup-dom.js             (i18n + models)
 ├── popup-render.js          (popup-dom, i18n, crypto, popup-state)
 ├── popup-events.js          (models, crypto, storage, popup-state, popup-render, popup-dialog, i18n)
 ├── popup-dialog.js          (models, crypto, popup-state, popup-render, i18n, storage)
 ├── popup-drag.js            (popup-state, popup-render, storage)
 ├── popup-collapse.js        (i18n, popup-state)
 └── popup-vault.js           (crypto, i18n)
```

## Bootstrap & Init Sequence (`popup-main.js`)

The startup order is **strict** — modules must init in this exact sequence:

```
await initI18n();                         // ⚠️ Step 0 — before anything else
                                          //     (translations needed by all modules)

initVault(dom);                           // Step 1 — vault state setup
initDialog(dom);                          // Step 2 — dialog wiring (events on #siteDialog)
initEvents(dom);                          // Step 3 — event delegation (click, dblclick, search)
initDrag(dom);                            // Step 4 — drag-and-drop (dragstart, dragover, drop, dragend)
initCollapse(dom);                        // Step 5 — collapse/expand (click on expandListBtn)

// ── Top-level event wiring (Step 6) ──
// unlock button, lock button, add site, settings, inline editor events,
// password toggle, strength meter, collapse-on-dblclick

// ── Bootstrap (Step 7) ──
await bootstrap();
  → bootstrapVaultGate()                  // Show vault gate (configured vs new user)
  → trySessionAutoUnlock()                // Session-based auto-unlock attempt
    → if unlocked: loadAndRender()
        → getWebsites()                   // Load from storage
        → sort by order
        → renderWebsites()                // Full DOM rebuild
        → updateEntryCount()
    → if locked: show vault gate UI
```

### Init Contract
Each `init*` function receives the `dom` refs object and stores its own module-level copy. This means every module independently holds references to the same DOM elements — if a DOM reference is broken (e.g., element removed from DOM), all modules that depend on it will fail silently.

## CRUD Flow Conventions

### When to Use Inline Editor vs Dialog

| Action | Mechanism | Module(s) Involved | Rationale |
|--------|-----------|-------------------|-----------|
| **Add new entry** | Inline editor card (`#inlineEditor`) inserted at top of `#websiteList` | `popup-main.js` (`showInlineEditor`, `saveFromInlineEditor`), `popup-dom.js` (`createInlineEditor`) | Quick single-credential input; keyboard-friendly (Enter to save, Escape to cancel) |
| **Edit existing entry** | `<dialog>` modal (`#siteDialog`) | `popup-events.js` (triggers via `openDialog()`), `popup-dialog.js` (full lifecycle) | Supports multiple credentials per entry, shows placeholder dots for encrypted values, preserves existing encrypted data |
| **Delete entry** | Inline via event delegation click on `.delete-site` | `popup-events.js` (`onListClick`) | Single click, instant removal with re-render |
| **View/manage credentials** | Inline credential pairs rendered per row | `popup-dom.js` (`createCredentialPair`), `popup-events.js` (lock/fill buttons) | Always visible; lock toggles password reveal, fill triggers autofill |

### When NOT to Use the Inline Editor
- **Editing existing entries** — always use the dialog (the inline editor does not support pre-population of encrypted data)
- **Entries with multiple credentials** — the inline editor creates only one credential; use the dialog for multi-credential entries
- **Bulk operations** — no bulk operations exist yet; if adding, consider a separate module

### Data Persistence Flow

```
Add (inline editor):
  showInlineEditor()         → popup-main.js
  → user fills inputs
  → saveFromInlineEditor()
    → encryptSecret(login)
    → encryptSecret(password)
    → createCredential()
    → createWebsite()
    → saveWebsites()
    → renderWebsites()
    → updateEntryCount()

Edit (dialog):
  openDialog(website)        → popup-dialog.js
  → user edits form
  → onSubmit(event)
    → encryptSecret() for changed fields
    → preserve encrypted data for unchanged (placeholder "••••••") fields
    → createWebsite()
    → saveWebsites()
    → renderWebsites()
    → updateEntryCount()

Delete (inline):
  onListClick → event.target.closest(".delete-site")
  → filter out from popupState.websites
  → saveWebsites()
  → renderWebsites()
  → updateEntryCount()
```

## Shared CSS Class Selectors — Conflict Matrix

The following CSS classes are **shared across multiple modules**. Adding a new interactive element that uses these classes can silently break existing behavior.

| Selector | Used By | How It's Used | Risk if Changed |
|----------|---------|---------------|-----------------|
| `.site-row` | `popup-dom.js` (creates), `popup-events.js` (clicks), `popup-drag.js` (drag) | `closest(".site-row")` to find parent row | **HIGH** — any element with this class inside `#websiteList` is matched by all three modules |
| `.site-row--editor` | `popup-dom.js` (styling), `popup-events.js` (non-match, exits early) | Only CSS + animation; events exit early because no `data-website-id` | **LOW** — events check `data-website-id` before processing |
| `.drag-handle` | `popup-dom.js` (creates), `popup-drag.js` (initiates drag) | Visual handle; drag is on the entire `.site-row` | **MEDIUM** — solely visual, drag behavior is row-level |
| `.open-site` | `popup-dom.js` (creates), `popup-events.js` (click + dblclick) | Open URL + copy URL on dblclick | **MEDIUM** — adding new elements with this class will trigger URL open behavior |
| `.edit-site` | `popup-dom.js` (creates), `popup-events.js` (click handler) | Opens dialog for editing | **MEDIUM** — adding new elements with this class triggers dialog open |
| `.delete-site` | `popup-dom.js` (creates), `popup-events.js` (click handler) | Deletes website entry | **HIGH** — adding new elements with this class triggers deletion |
| `.minimize-site` | `popup-dom.js` (creates), `popup-events.js` (click handler) | Minimizes site row | **MEDIUM** — adding triggers minimize |
| `.cred-pair` | `popup-dom.js` (creates), `popup-events.js` (lock/fill delegation) | Credential display row | **MEDIUM** — events check `data-cred-id` before proceeding |
| `.cred-pair__lock` | `popup-dom.js` (creates), `popup-events.js` (`handleLockClick`) | Toggle password reveal | **LOW** — scoped by parent `.cred-pair` |
| `.cred-pair__fill` | `popup-dom.js` (creates), `popup-events.js` (`handleFillClick`) | Trigger autofill | **LOW** — scoped by parent `.cred-pair` |
| `.cred-pair__login` | `popup-dom.js` (creates), `popup-events.js` (dblclick → copy) | Copy login on dblclick | **LOW** — double-click specific |
| `.minimized-site` | `popup-events.js` (creates in `handleMinimize`, dblclick → restore) | Minimized chip in `#minimizedList` | **MEDIUM** — relies on `data-website-id` |
| `.empty-state` | `popup-dom.js` (creates), `popup-main.js` (hides during inline editing) | Empty state shown when no entries | **LOW** — only visibility toggle |
| `.dragging` | `popup-drag.js` (adds/removes), `popup.css` (styles) | Visual dragging state | **LOW** — style-only |

## Modules to Verify When Adding New Interactive Card Types

If you add a new **card type** (like the inline editor `.site-row--editor`), follow this checklist:

### 1. Selector Conflict Scan
Check if your new card uses any of these **HIGH-risk** selectors:
- `.site-row` — will be caught by drag + event handlers
- `.delete-site` — will trigger deletion
- `.open-site` — will trigger URL open
- `.edit-site` — will trigger dialog open

### 2. Module Verification Checklist

| Module | What to Check |
|--------|---------------|
| **`popup-dom.js`** | Does the new card need a factory function? Does it use shared class names? |
| **`popup-events.js`** | Does `onListClick` handle or gracefully ignore clicks on the new card? Does `onListDblClick` need updating? Does the new card need its own event delegation? |
| **`popup-drag.js`** | Does the new card have `draggable=true`? If inside `#websiteList`, drag events will fire on it. Either add `draggable=false` or handle `onDragStart` exit. |
| **`popup-render.js`** | Does the new card need to be rendered via `renderWebsites`? Does it need special handling during search/filter? |
| **`popup-state.js`** | Does the new card require new state properties? |
| **`popup-collapse.js`** | Does the new card need to be hidden/shown on collapse? |
| **`popup-main.js`** | Does the new card need top-level event wiring? Bootstrap logic? |

### 3. Safety Patterns
- **New card inside `#websiteList`**: Add `data-website-id` attribute if it represents a website, OR ensure `onListClick` exits early for the new card type
- **New card outside `#websiteList`** (like `#minimizedList`): Must have its own `.addEventListener()` calls in `wireEvents()` — see the Container Boundary Rule in `.clinerules`
- **New action button**: Use a unique class name NOT listed in the Conflict Matrix above. Add handler in `onListClick` via `closest(".your-new-class")`

## Event Delegation Architecture

```
popup-events.js :: wireEvents()
                          
container           listeners              handler actions
─────────           ──────────              ──────────────
#websiteList         click  → onListClick     open, edit, delete, lock, fill, minimize
                     dblclick → onListDblClick  copy URL, copy login, restore minimized
                     
#searchInput         input → onSearch         filter + re-render
                     
#minimizedList       dblclick → onListDblClick  restore minimized chip
```

### ⚠️ Container Boundary Rule
Events from `#minimizedList` children do **NOT** bubble to `#websiteList` listeners. If you add a new sibling container, it **MUST** have its own `.addEventListener()` call in `wireEvents()`.

## Drag-and-Drop Architecture

```
popup-drag.js :: wireDragEvents()

container      listeners              behavior
─────────      ──────────              ────────
#websiteList    dragstart → onDragStart  Identify .site-row source, set dataTransfer
                dragover  → onDragOver   Reorder DOM children visually
                drop      → onDrop       Persist new order to storage, re-render
                dragend   → onDragEnd    Clean up .dragging class
```

### Drag Integrity Rules
1. All `.site-row` elements are `draggable=true` (set by `createSiteRow` in `popup-dom.js`)
2. Non-draggable elements inside `#websiteList` (like `.empty-state`, `.site-row--editor`) will trigger `onDragStart` → `closest(".site-row")` returns null → `e.preventDefault()` aborts the drag — this is safe
3. After drop, the entire list is re-rendered via `renderWebsites()` — any DOM state outside `popupState.websites` is lost (e.g., revealed passwords, minimized state in `#minimizedList`)

## Popup State Shape

```js
popupState = {
  websites: [],           // Array of website objects from storage
  editWebsiteId: null,    // ID of website being edited in dialog
  searchQuery: "",        // Current search filter text
  collapsed: false,       // Is the list collapsed to floating button?
  _toastTimer: null       // Internal timer reference for toast auto-hide
}

// Helper
filteredWebsites()        // Returns websites filtered by searchQuery
```

## Vault State Machine

```
                    ┌─────────────────┐
                    │   VAULT_LOCKED   │
                    │ (session empty)  │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │             │             │
         new user        configured    session valid
               │             │             │
               ▼             ▼             │
    ┌──────────────────┐  ┌──────────┐     │
    │ setupMasterPass() │  │ unlock() │     │
    └────────┬─────────┘  └────┬─────┘     │
             │                 │           │
             └────────┬────────┘           │
                      ▼                   │
               ┌──────────────┐           │
               │  VAULT_OPEN  │◄──────────┘
               │ (decrypt ok) │
               └──────┬───────┘
                      │
                  lockVault()
                      │
                      ▼
               ┌─────────────────┐
               │   VAULT_LOCKED   │
               └─────────────────┘
```

## Common Pitfalls

1. **Dialog vs Inline Editor overlap**: The inline editor (`#inlineEditor`) is defined in HTML and moved into `#websiteList` via JS. The dialog (`#siteDialog`) is a `<dialog>` element. They are **not** mutually exclusive — both can be open simultaneously (though the dialog is modal).

2. **Password reveal state lost on re-render**: Revealed passwords (`.cred-pair__password-reveal` elements) are ephemeral DOM state. Any call to `renderWebsites()` destroys them. This is by design — passwords should auto-hide on re-render.

3. **Minimized state lost on re-render**: Minimized chips in `#minimizedList` are also DOM-only state. `renderWebsites()` re-renders only `#websiteList`. However, `onDrop` in drag calls `renderWebsites()` which does NOT restore minimized chips — they must be re-created or the full state must be preserved.

4. **Toast timer**: Only one toast timer (`popupState._toastTimer`) exists. Rapid successive toasts will cancel each other.

5. **`.clinerules` is the source of truth** for project conventions. This document supplements it with detailed module boundaries. When updating conventions, update `.clinerules` first.
