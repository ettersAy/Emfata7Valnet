# Problem

The security audit (2026-05-01) identified three CRITICAL vulnerabilities that make the vault unsafe for production use:

1. **Master password stored in plaintext** in `chrome.storage.session` (`popup-vault.js` handleUnlock + `crypto-change-password.js` changeMasterPassword). Any extension with `storage` permission or malware can read the raw master password, completely bypassing the PBKDF2+AES-GCM encryption scheme.
2. **Autofill sends credentials to any active tab without hostname verification** (`popup-actions.js` handleFillClick). The SECURITY.md claims this exists but it was never implemented. A phishing site can receive credentials simply by being the active tab when the user clicks autofill.
3. **Master password minimum length is 4 characters** (`popup-vault.js` handleUnlock). A 4-char password is crackable in milliseconds. Industry minimum is 12+ chars.

# Improvement Needed

### Fix 1 — Remove plaintext master password from session storage

**Files:** `src/popup/popup-vault.js`, `src/common/crypto-change-password.js`

- Delete the `chrome.storage.session.set({ session_master_password, ... })` block in `handleUnlock()`.
- Delete the equivalent block in `changeMasterPassword()`.
- Keep the per-date auto-unlock: store only `session_unlock_date` in session storage, rely on `CryptoKey` (`sessionKey`) in JS heap, and verify with the existing salt+verifier mechanism on each popup open (the verifier decrypt check already works — `unlockMasterPassword` doesn't need the raw password if the key is already in memory).
- Update `trySessionAutoUnlock()` in `popup-vault.js`: since we no longer store the raw password, check whether `isUnlocked()` is true (key still in memory from earlier in the same browser session) AND the date matches today. If the service worker restarted and the key is gone, fall back to showing the vault gate.
- Remove the `SESSION_KEYS.MASTER_PASSWORD` constant and any references.

### Fix 2 — Implement hostname verification before autofill

**File:** `src/popup/popup-actions.js`

In `handleFillClick()`, after getting the active tab and decrypting credentials, add:

```js
// Verify active tab hostname matches stored website hostname
const tabUrl = new URL(tab.url);
const storedHost = new URL(
  /^https?:\/\//i.test(website.url) ? website.url : `https://${website.url}`
).hostname.replace(/^www\./, "");
const tabHost = tabUrl.hostname.replace(/^www\./, "");

if (tabHost !== storedHost) {
  showToast(listMessage, t("hostnameMismatch"), "warning");
  return;
}
```

- Add the `hostnameMismatch` i18n key to `src/common/i18n.js` (e.g., `"Hostname mismatch — credentials not filled."`).
- Also add the check in `src/content/autofill-content.js` as defense-in-depth: verify `window.location.hostname` against the stored hostname before filling (pass it in the message payload).

### Fix 3 — Raise minimum master password length to 12

**File:** `src/popup/popup-vault.js`

Change:
```js
if (!password || password.length < 4) {
```
To:
```js
if (!password || password.length < 12) {
```

- Update the `minLengthError` i18n key to say "Minimum 12 characters".
- Update the password strength meter (`popup-password-strength.js`) to show "Weak" for <12, "Fair" for 12–15, "Strong" for 16+.
- Add a recommendation hint for passphrase-style passwords (e.g., "Use a passphrase like 'correct-horse-battery-staple'").

# Expected Result

- The raw master password is never persisted to any storage. Only the `CryptoKey` exists in JS memory.
- Autofill refuses to fill credentials on any tab whose hostname doesn't match the stored website.
- Users are forced to choose master passwords of 12+ characters.
- The vault reaches **baseline acceptable** security for local password management.
