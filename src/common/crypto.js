/**
 * Crypto barrel module — re-exports all crypto functions.
 *
 * Each responsibility is now in its own file:
 *   crypto-base.js         — Core primitives (deriveKey, encryptWithKey, etc.)
 *   crypto-vault.js         — Vault authentication
 *   crypto-secrets.js       — Encrypt/decrypt individual secrets
 *   crypto-change-password.js — Master password change
 *
 * Existing code imports from "./crypto.js" will continue to work unchanged.
 */
export {
  toBase64,
  fromBase64,
  deriveKey,
  encryptWithKey,
  normalizePayload,
  decryptWithKey
} from "./crypto-base.js";

export {
  isMasterPasswordConfigured,
  setupMasterPassword,
  unlockMasterPassword,
  isUnlocked,
  lockVault
} from "./crypto-vault.js";

export {
  encryptSecret,
  decryptSecret
} from "./crypto-secrets.js";

export {
  changeMasterPassword
} from "./crypto-change-password.js";
