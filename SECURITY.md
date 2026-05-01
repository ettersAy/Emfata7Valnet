# Security audit and hardening notes

## What was risky before

1. **Passwords were stored in plaintext** in `chrome.storage.local`.
2. **Passwords were exposed in UI tooltips** (hovering the lock icon revealed secrets).
3. **Autofill could run without host verification** for a selected credential, making phishing/replay easier.
4. **Broad host permissions (`<all_urls>`)** increase attack surface.

## Security measures implemented

### 1) Encryption at rest (master password)
- Added a master-password vault gate.
- Credentials are now encrypted using:
  - PBKDF2-SHA256 key derivation (210,000 iterations)
  - AES-256-GCM encryption with per-secret random IV
- Salt and encrypted verifier are stored locally; the master password is **not** stored.
- Decryption key is kept only in extension runtime memory after unlock.

### 2) No plaintext password disclosure in popup
- Removed password tooltip exposure from credential chips.

### 3) Domain-bound autofill
- Autofill now checks that the active tab hostname exactly matches the stored website hostname before filling.

### 4) Operational guidance
- Use a long unique master password (passphrase style).
- Keep browser profile OS-encrypted and device locked.
- Never install untrusted extensions in the same profile.
- Prefer dedicated browser profile for sensitive credentials.

## Remaining risks and best-practice proposals

1. **Current model is local-only software security**; malware running as your OS user can still steal unlocked secrets.
2. **`<all_urls>` content script is broad**. Improve by replacing static content scripts with on-demand `chrome.scripting.executeScript` only on trusted origins.
3. **No anti-phishing origin policy beyond hostname equality**. Improve with stricter origin/path rules and optional user approval per fill event.

## More secure architecture proposal (hosted secret backend)

For stronger protection, move secret storage out of extension-local storage:

- Use a hosted secrets API (or self-hosted vault service).
- Store only encrypted metadata and secret IDs in the extension.
- Fetch encrypted secrets just-in-time after user auth (WebAuthn/passkey + short-lived token).
- Perform key unwrap with platform keystore/WebAuthn-backed key material.
- Add server-side risk checks (IP/device binding, anomaly detection, rate limiting, audit logs).
- Rotate credentials and revoke sessions centrally.

This design reduces local blast radius and enables centralized incident response.
