/**
 * Vault authentication module for مفاتيح.
 * Single responsibility: manage master password setup, unlock, and lock.
 * Depends on crypto-base for key derivation and encryption primitives.
 */
import { STORAGE_KEYS } from "./constants.js";
import {
  deriveKey,
  deriveKeyWithIterations,
  encryptWithKey,
  decryptWithKey,
  toBase64,
  fromBase64,
  KDF_ITERATIONS
} from "./crypto-base.js";

// Previous iteration count — used to migrate existing vaults to the new count.
const OLD_KDF_ITERATIONS = 210000;

/** @type {CryptoKey|null} */
let sessionKey = null;

/**
 * Check if the master password has been configured.
 * @returns {Promise<boolean>}
 */
export async function isMasterPasswordConfigured() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.MASTER_SALT, STORAGE_KEYS.MASTER_VERIFIER]);
  return Boolean(data[STORAGE_KEYS.MASTER_SALT] && data[STORAGE_KEYS.MASTER_VERIFIER]);
}

/**
 * Set up the master password for the first time.
 * Generates salt, derives key, stores verifier.
 * @param {string} password
 */
export async function setupMasterPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(password, salt);
  const verifier = await encryptWithKey(key, "vault-ready");

  await chrome.storage.local.set({
    [STORAGE_KEYS.MASTER_SALT]: toBase64(salt),
    [STORAGE_KEYS.MASTER_VERIFIER]: verifier
  });

  sessionKey = key;
}

/**
 * Attempt to unlock the vault with the given password.
 * @param {string} password
 * @returns {Promise<boolean>}
 */
/**
 * Attempt to unlock the vault. Tries the current KDF iteration count first,
 * falls back to the old count for migration, and re-encrypts the verifier if
 * the vault was created with an older iteration count.
 */
export async function unlockMasterPassword(password) {
  const data = await chrome.storage.local.get([STORAGE_KEYS.MASTER_SALT, STORAGE_KEYS.MASTER_VERIFIER]);
  const saltBase64 = data[STORAGE_KEYS.MASTER_SALT];
  const verifier = data[STORAGE_KEYS.MASTER_VERIFIER];
  if (!saltBase64 || !verifier) return false;

  const salt = fromBase64(saltBase64);

  // Try current iteration count
  const key = await deriveKey(password, salt);
  try {
    const plain = await decryptWithKey(key, verifier);
    if (plain === "vault-ready") {
      sessionKey = key;
      return true;
    }
  } catch { /* fall through to migration attempt */ }

  // Migration: try old iteration count, re-encrypt if successful
  try {
    const oldKey = await deriveKeyWithIterations(password, salt, OLD_KDF_ITERATIONS);
    const plain = await decryptWithKey(oldKey, verifier);
    if (plain === "vault-ready") {
      // Re-encrypt verifier with current iteration count
      const newVerifier = await encryptWithKey(oldKey, "vault-ready");
      // Generate fresh salt with current iterations and re-derive
      const newSalt = crypto.getRandomValues(new Uint8Array(16));
      const migratedKey = await deriveKey(password, newSalt);
      const migratedVerifier = await encryptWithKey(migratedKey, "vault-ready");
      await chrome.storage.local.set({
        [STORAGE_KEYS.MASTER_SALT]: toBase64(newSalt),
        [STORAGE_KEYS.MASTER_VERIFIER]: migratedVerifier
      });
      sessionKey = migratedKey;
      return true;
    }
  } catch { /* migration failed */ }

  return false;
}

/**
 * Check if the vault is currently unlocked.
 * @returns {boolean}
 */
export function isUnlocked() {
  return Boolean(sessionKey);
}

/**
 * Get the current session key.
 * @returns {CryptoKey|null}
 */
export function getSessionKey() {
  return sessionKey;
}

/**
 * Set the session key (used during password change re-encryption).
 * @param {CryptoKey|null} key
 */
export function setSessionKey(key) {
  sessionKey = key;
}

/**
 * Lock the vault by clearing the session key.
 */
export function lockVault() {
  sessionKey = null;
}
