import { DEFAULT_FIELD_KEYWORDS, STORAGE_KEYS } from "./constants.js";
import { getSessionKey } from "./crypto-vault.js";
import { toBase64, fromBase64 } from "./crypto-base.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

/**
 * Derive a dedicated HMAC key from the session key for integrity checks.
 * Uses HKDF to avoid key reuse with AES-GCM.
 */
async function deriveIntegrityKey(sessionKey) {
  return crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: textEncoder.encode("mafati7-integrity-hmac"),
      info: textEncoder.encode("credential-store-integrity")
    },
    sessionKey,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign", "verify"]
  );
}

/**
 * Compute and store an HMAC-SHA256 signature over the serialized websites array.
 */
async function storeIntegrity(websites) {
  const key = getSessionKey();
  if (!key) return; // Vault is locked — skip
  try {
    const integrityKey = await deriveIntegrityKey(key);
    const data = textEncoder.encode(JSON.stringify(websites));
    const signature = await crypto.subtle.sign("HMAC", integrityKey, data);
    await chrome.storage.local.set({
      [STORAGE_KEYS.INTEGRITY]: toBase64(new Uint8Array(signature))
    });
  } catch {
    // Integrity storage is best-effort
  }
}

/**
 * Verify the stored HMAC signature matches the serialized websites array.
 * Throws if tampering is detected.
 */
async function verifyIntegrity(websites) {
  const key = getSessionKey();
  if (!key) return; // Vault is locked — skip verification

  const { [STORAGE_KEYS.INTEGRITY]: storedSig } = await chrome.storage.local.get(STORAGE_KEYS.INTEGRITY);
  if (!storedSig) return; // No integrity record yet — skip (first save)

  try {
    const integrityKey = await deriveIntegrityKey(key);
    const data = textEncoder.encode(JSON.stringify(websites));
    const valid = await crypto.subtle.verify(
      "HMAC",
      integrityKey,
      fromBase64(storedSig),
      data
    );
    if (!valid) {
      throw new Error("Credential store integrity check failed — possible tampering detected.");
    }
  } catch (err) {
    // Re-throw verification failures but not crypto errors
    if (err.message.includes("integrity")) throw err;
  }
}

export async function getWebsites() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.WEBSITES);
  const websites = data[STORAGE_KEYS.WEBSITES] ?? [];
  await verifyIntegrity(websites);
  return websites;
}

export async function saveWebsites(websites) {
  await chrome.storage.local.set({ [STORAGE_KEYS.WEBSITES]: websites });
  await storeIntegrity(websites);
}

export async function getFieldKeywords() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.FIELD_KEYWORDS);
  return data[STORAGE_KEYS.FIELD_KEYWORDS] ?? DEFAULT_FIELD_KEYWORDS;
}

export async function saveFieldKeywords(fieldKeywords) {
  await chrome.storage.local.set({ [STORAGE_KEYS.FIELD_KEYWORDS]: fieldKeywords });
}
