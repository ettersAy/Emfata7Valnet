# Problem

After Phase 1 fixes, four HIGH-severity issues remain that significantly weaken the vault's security posture:

1. **`<all_urls>` content script injected everywhere** (`manifest.json` + `autofill-content.js`). The content script runs on every page including malicious ones, creating unnecessary attack surface. Any renderer compromise on any page grants access to the extension's message channel.
2. **Password title attribute still shows plaintext on hover** (`popup-actions.js` handleLockClick). The SECURITY.md claims tooltip exposure was removed, but `reveal.title = plain` persists — passwords appear in browser tooltips when hovering the revealed password span.
3. **Export dumps encrypted blobs without user warning** (`options-export.js`). Users may not realize the exported JSON/CSV contains their encrypted credentials, which can be brute-forced offline if the master password is weak.
4. **PBKDF2-SHA256 at 210K iterations is below current OWASP recommendations** (`crypto-base.js`). OWASP 2023 recommends 600,000 iterations for PBKDF2-SHA256. Lower iteration counts make offline brute-force attacks faster.

# Improvement Needed

### Fix 4 — Replace static `<all_urls>` content script with on-demand injection

**Files:** `manifest.json`, `src/popup/popup-actions.js`, `src/background/service-worker.js`

- Remove the `content_scripts` block entirely from `manifest.json`.
- Keep `"host_permissions": ["<all_urls>"]` and `"permissions": ["scripting", ...]` (the `scripting` permission is already declared).
- In `handleFillClick()` (`popup-actions.js`), instead of `chrome.tabs.sendMessage`, use:
  ```js
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["src/content/autofill-content.js"]
  });
  // Then send the fill message
  await chrome.tabs.sendMessage(tab.id, { type: "RUN_AUTOFILL", payload: { ... } });
  ```
- Or better: move autofill orchestration entirely to the service worker. The popup sends a "fill request" to the service worker, which injects the script, verifies hostname, and sends the message.
- Update `src/content/autofill-content.js`: after filling, have it remove its own message listener to avoid stale listeners on reinjection, or check a flag.

### Fix 5 — Remove password from title attribute

**File:** `src/popup/popup-actions.js`

In `handleLockClick()`, remove the line:
```js
reveal.title = plain;
```
Change to:
```js
// No tooltip — password should never appear in a title attribute
```
Also review `createCredentialPair()` in `popup-dom.js` — the `loginSpan.title` line shows the login in tooltip (acceptable, login is not secret by design), but ensure no password is set as a title anywhere.

### Fix 6 — Add user warning before export

**Files:** `src/options/sections/options-export.js`, `src/options/options.html` (if needed)

- Before generating the export blob, show a confirmation dialog warning the user:
  ```
  "The exported file contains your encrypted credentials. Anyone with this file and 
  your master password can decrypt your vault. Keep the file secure and use a strong 
  master password."
  ```
- Require explicit user confirmation (`confirm()` or a custom modal) before proceeding.
- Add a `data-i18n` key `exportSecurityWarning` for the warning text.

### Fix 7 — Increase PBKDF2 iterations to 600,000+

**File:** `src/common/crypto-base.js`

Change:
```js
const KDF_ITERATIONS = 210000;
```
To:
```js
const KDF_ITERATIONS = 600000;
```

- **Important:** When changing iterations, existing verifiers and encrypted data must be re-encrypted. Add a migration path:
  - On unlock with the old iteration count, derive the key normally.
  - After successful unlock, check if the stored salt uses the old iteration count by storing an `iteration_count` in storage (or comparing a known verifier pattern).
  - If old, re-derive the key with new iterations, re-encrypt the verifier, and re-encrypt all credentials (reuse the `changeMasterPassword` logic but with the same password).
  - Add `kdf_iterations` to `STORAGE_KEYS` in `constants.js`.
- Test the migration with existing vault data before deployment.

# Expected Result

- Content script is only injected on the single tab being autofilled, not every page.
- Passwords have zero tooltip/hover exposure — only visible in the DOM textContent when explicitly revealed by the user.
- Users are explicitly warned about export sensitivity and must confirm before downloading.
- PBKDF2 uses 600K+ iterations, bringing it in line with OWASP 2023 standards, with automatic migration for existing vaults.
