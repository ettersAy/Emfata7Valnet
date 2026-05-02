/**
 * Core cryptographic primitives for مفاتيح.
 * Single responsibility: provide low-level AES-GCM encryption/decryption
 * with PBKDF2 key derivation, base64 utilities, and payload normalization.
 */
import { STORAGE_KEYS } from "./constants.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const KDF_ITERATIONS = 600000; // OWASP 2023 recommendation for PBKDF2-SHA256

/**
 * Convert Uint8Array to base64 string.
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 string to Uint8Array.
 * @param {string} base64
 * @returns {Uint8Array}
 */
export function fromBase64(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

/**
 * Derive an AES-GCM key from a password and salt using PBKDF2.
 * @param {string} password
 * @param {Uint8Array} salt
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a string value using AES-GCM with the given key.
 * @param {CryptoKey} key
 * @param {string} value
 * @returns {Promise<{iv: string, value: string}>}
 */
export async function encryptWithKey(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(value)
  );
  return {
    iv: toBase64(iv),
    value: toBase64(new Uint8Array(cipher))
  };
}

/**
 * Normalize an encrypted payload that may be in old string format ("iv:value")
 * to the current object format ({ iv, value }).
 * @param {*} payload
 * @returns {{iv: string, value: string}|null}
 */
export function normalizePayload(payload) {
  if (!payload) return null;
  if (typeof payload === "object" && payload.iv && payload.value) {
    return payload;
  }
  if (typeof payload === "string" && payload.includes(":")) {
    const [iv, value] = payload.split(":");
    if (iv && value) {
      return { iv, value };
    }
  }
  return null;
}

/**
 * Decrypt an AES-GCM encrypted payload with the given key.
 * @param {CryptoKey} key
 * @param {*} payload
 * @returns {Promise<string>}
 */
export async function decryptWithKey(key, payload) {
  const normalized = normalizePayload(payload);
  if (!normalized) {
    throw new Error("Invalid encrypted payload: missing iv or value.");
  }
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(normalized.iv) },
    key,
    fromBase64(normalized.value)
  );
  return textDecoder.decode(plain);
}

/**
 * Derive a key with a specific iteration count (for migration from old counts).
 */
export async function deriveKeyWithIterations(password, salt, iterations) {
  const material = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export { textEncoder, textDecoder, KDF_ITERATIONS };
