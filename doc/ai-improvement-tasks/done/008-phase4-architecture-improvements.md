# Problem

Even after Phases 1–3, the vault's architecture has four structural weaknesses that limit its long-term security posture:

1. **Credential operations happen in the popup** — The popup directly decrypts credentials, injects content scripts, and sends autofill messages. This means the popup (a short-lived, UI-facing context) holds the CryptoKey and handles secrets. A compromised popup context (XSS via extension page, malicious devtools) leaks everything.
2. **No integrity check over the full credential store** — Each credential is individually AES-GCM encrypted (which authenticates per-record), but there's no HMAC or signature covering the entire store. An attacker who can write to `chrome.storage.local` could delete, reorder, or inject fabricated encrypted entries without detection.
3. **PBKDF2-SHA256 remains GPU-friendly** — Even at 600K iterations, SHA-256 is efficiently parallelizable on GPUs/ASICs. Memory-hard algorithms like Argon2id resist hardware acceleration.
4. **No per-fill user confirmation for sensitive/untrusted sites** — Autofill happens silently after a single click. Users get no confirmation before credentials are sent to a site they've never autofilled before.

# Improvement Needed

### Fix 13 — Move credential operations to the service worker

**Files:** `src/background/service-worker.js` (major rewrite), `src/popup/popup-actions.js`, `src/popup/popup-bootstrap.js`, `src/popup/popup-render.js`

- **Architecture change:** The service worker becomes the sole holder of the `CryptoKey` (`sessionKey`). The popup never imports `crypto-vault.js` directly.
- **Message-based API:** Define a message protocol between popup and service worker:
  - `{ type: "UNLOCK", password }` → `{ success: boolean }`
  - `{ type: "LOCK" }` → `{ success: true }`
  - `{ type: "GET_WEBSITES" }` → `{ websites: [...] }` (with logins pre-decrypted for display, passwords remain encrypted)
  - `{ type: "GET_DECRYPTED_CREDENTIAL", websiteId, credId }` → `{ login, password }`
  - `{ type: "SAVE_WEBSITES", websites }` → `{ success: true }`
  - `{ type: "AUTOFILL", websiteId, credId, tabId }` → service worker verifies hostname, decrypts, injects content script on the target tab, sends fill message
- **Popup changes:**
  - `popup-vault.js` becomes a thin wrapper that sends UNLOCK/LOCK messages to the service worker.
  - `popup-actions.js` sends AUTOFILL requests instead of directly calling `chrome.tabs.sendMessage`.
  - `popup-render.js` requests pre-decrypted websites from the service worker (logins only, not passwords).
  - `handleLockClick()` sends `GET_DECRYPTED_CREDENTIAL` to get the password on-demand.
- **Service worker state:** Import `crypto-vault.js` and `crypto-secrets.js`. Hold `sessionKey`. Handle all message types. Implement hostname verification centrally.
- **Security benefit:** If the popup is compromised (XSS, devtools tampering), the attacker cannot access the CryptoKey or decrypt credentials without the service worker's cooperation.

### Fix 14 — Add HMAC integrity check over the full credential store

**Files:** `src/common/crypto-base.js` (new function), `src/common/storage.js`, `src/common/constants.js`

- Add a `STORAGE_KEYS.INTEGRITY` key (`"credential_integrity"`).
- On every `saveWebsites()` call, compute an HMAC-SHA256 over `JSON.stringify(websites)` using a key derived from the session key:
  ```js
  const integrityKey = await crypto.subtle.deriveKey(
    { name: "HMAC", hash: "SHA-256", length: 256 },
    sessionKey,  // or a sub-key derived from it
    false,
    ["sign", "verify"]
  );
  const data = new TextEncoder().encode(JSON.stringify(websites));
  const signature = await crypto.subtle.sign("HMAC", integrityKey, data);
  await chrome.storage.local.set({
    credential_integrity: toBase64(new Uint8Array(signature))
  });
  ```
- On `getWebsites()`, verify the stored signature matches before returning data. If mismatch, throw an error and warn the user of potential tampering.
- Derive the HMAC key from a separate PBKDF2 context (different salt/purpose) to avoid key reuse with AES-GCM.

### Fix 15 — Evaluate WebAssembly-based Argon2id

**Files:** New `src/common/argon2.js`, `src/common/crypto-base.js`

- Research audited Argon2id WASM implementations (e.g., `argon2-browser` or `hash-wasm`).
- If a suitable library is found and audited:
  - Add it as a vendored dependency (no remote CDN — bundle the WASM in the extension).
  - Create `deriveKeyArgon2(password, salt)` in a new `argon2.js` module.
  - Use Argon2id parameters: memory=64MB, iterations=3, parallelism=4 (OWASP minimum).
  - Fall back to PBKDF2-SHA256 with higher iterations if Argon2 is unavailable.
  - Migration: On first unlock after upgrade, re-derive with Argon2, re-encrypt verifier, store `kdf_algorithm: "argon2id"` in storage.
- **Important constraints:** Web Crypto API does not support Argon2. A WASM library adds ~50–100KB to the extension and must be carefully audited for side-channel resistance. This fix should only proceed after thorough security review of the chosen library.

### Fix 16 — Add per-fill user confirmation for untrusted sites

**Files:** `src/popup/popup-actions.js`, `src/popup/popup-dom.js`, `src/popup/popup.css`

- Track "trusted" websites in storage (`STORAGE_KEYS.TRUSTED_SITES` — an array of hostnames the user has confirmed).
- When autofilling a site not in the trusted list:
  - Show a confirmation dialog: `"Autofill credentials on example.com? [Confirm] [Cancel]"`.
  - If the user confirms, add the hostname to trusted sites and proceed.
  - If cancelled, abort.
- Alternative (simpler): Show a brief toast "Autofilling on {hostname}" for 2 seconds before actually filling, with an undo/cancel option.
- This provides a phishing safeguard even if hostname matching somehow fails.

# Expected Result

- Service worker is the sole security boundary for credential operations. Popup is a "dumb" UI that requests data.
- Tampering with the stored credential list (deletion, injection, reordering) is detected via HMAC integrity check.
- (Stretch goal) Argon2id key derivation resists GPU/ASIC brute-force attacks.
- Users are prompted before autofilling on any site they haven't explicitly trusted before.
- The vault reaches a **strong** security posture comparable to commercial password managers.
