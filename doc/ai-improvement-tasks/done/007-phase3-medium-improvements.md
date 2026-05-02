# Problem

After Phase 1–2 fixes, five MEDIUM-severity operational weaknesses remain that reduce defense-in-depth:

1. **No auto-lock timer** — Once unlocked, the vault stays unlocked indefinitely as long as the browser session lives. The CryptoKey persists in JS heap with no inactivity-based re-lock.
2. **Passwords persist in system clipboard** — Copied passwords via `navigator.clipboard.writeText()` remain indefinitely, readable by any application.
3. **Options/settings page accessible without vault unlock** — The settings button is visible and functional even when the vault is locked, allowing import/export and master password changes.
4. **Import validation is minimal** — Only `id` and `url` fields are checked. No duplicate-ID detection, no size limits, no prototype pollution protection.
5. **No Content Security Policy declared in manifest** — While MV3 has a default CSP, being explicit is a best practice.

# Improvement Needed

### Fix 8 — Implement auto-lock after inactivity

**Files:** `src/background/service-worker.js`, `src/popup/popup-vault.js`

- Add an idle timer in the service worker:
  - Listen for `chrome.idle.onStateChanged` with `"idle"` state.
  - After 5 minutes of idle, call `lockVault()` (clear sessionKey) and clear session storage date.
  - Optionally add a heartbeat from the popup: every 30 seconds, the popup sends a keep-alive message to the service worker. If the popup closes, the service worker locks after a timeout (e.g., 2 minutes).
- Expose a `lockVault()` message handler in the service worker so the popup can trigger lock remotely.
- Store the unlock timestamp in session storage and check it on every popup render: if > 1 hour since unlock, force re-lock.

### Fix 9 — Clear clipboard after copy

**File:** `src/popup/popup-actions.js`

In `handleCopy()`, after `navigator.clipboard.writeText(text)`, add:
```js
// Clear clipboard after 30 seconds
clearTimeout(window._clipboardTimer);
window._clipboardTimer = setTimeout(async () => {
  try {
    const current = await navigator.clipboard.readText();
    if (current === text) {
      await navigator.clipboard.writeText("");
    }
  } catch { /* clipboard may be inaccessible */ }
}, 30000);
```

- Use a module-level timer variable instead of `window._clipboardTimer` — store on `popupState` or a local `let clipboardTimer`.
- Only clear if the clipboard still contains exactly the copied text (avoid wiping unrelated clipboard content).

### Fix 10 — Gate options page behind vault unlock

**Files:** `src/options/options-main.js`, `src/options/options.html`

- In `options-main.js`, on initialization, import `isUnlocked` from `../common/crypto-vault.js`.
- If the vault is locked, hide the normal options UI and show a lock screen with an unlock form (reuse the vault-gate pattern from `popup.html`).
- Alternatively: if locked, redirect to `popup.html` and show a message "Unlock the vault first from the extension popup."
- Hide the settings button in `popup.html` when the vault is locked (already partially done — `lockVaultBtn` is hidden when locked; extend to `openSettingsBtn`).

### Fix 11 — Declare CSP in manifest

**File:** `manifest.json`

Add:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

- This is the MV3 default but being explicit documents intent and prevents accidental weakening.
- Verify no inline scripts exist (already confirmed — all scripts are `type="module"` loaded from files).

### Fix 12 — Stricter import validation

**File:** `src/options/sections/options-import.js`

Add validation:
- **Size limit:** Reject files > 10 MB before parsing.
- **Duplicate IDs:** Check for duplicate `w.id` values in the imported array and reject if found.
- **Credential structure:** Validate that each `website.credentials[]` entry has `id`, `loginEncrypted`, and `passwordEncrypted` fields.
- **Prototype pollution:** Use `Object.create(null)` or sanitize parsed JSON keys (though `JSON.parse` with no reviver is generally safe, add a comment noting this).
- **Entry count limit:** Reject if `websites.length > 10000` to prevent storage exhaustion.

# Expected Result

- Vault automatically locks after 5 minutes of system idle or popup close.
- Copied passwords are wiped from clipboard after 30 seconds.
- Settings page is inaccessible without vault unlock.
- CSP is explicitly declared in the manifest.
- Import rejects oversized, malformed, or duplicate-heavy dumps before writing to storage.
