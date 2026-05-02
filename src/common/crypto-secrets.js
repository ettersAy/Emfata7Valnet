/**
 * Secrets encryption/decryption module for مفاتيح.
 * Single responsibility: encrypt and decrypt individual credential secrets
 * using the current session key from crypto-vault.
 */
import { getSessionKey } from "./crypto-vault.js";
import { encryptWithKey, decryptWithKey } from "./crypto-base.js";

/**
 * Encrypt a secret value with the current session key.
 * @param {string} value
 * @returns {Promise<{iv: string, value: string}>}
 */
export async function encryptSecret(value) {
  const key = getSessionKey();
  if (!key) throw new Error("Vault is locked.");
  return encryptWithKey(key, value);
}

/**
 * Decrypt a secret payload with the current session key.
 * @param {*} payload - encrypted payload ({iv, value} or old "iv:value" string)
 * @returns {Promise<string>}
 */
export async function decryptSecret(payload) {
  const key = getSessionKey();
  if (!key) throw new Error("Vault is locked.");
  return decryptWithKey(key, payload);
}
