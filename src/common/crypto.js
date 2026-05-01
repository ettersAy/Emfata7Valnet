import { STORAGE_KEYS } from "./constants.js";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const KDF_ITERATIONS = 210000;
let sessionKey = null;

function toBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(base64) {
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

async function deriveKey(password, salt) {
  const material = await crypto.subtle.importKey("raw", textEncoder.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: KDF_ITERATIONS, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function isMasterPasswordConfigured() {
  const data = await chrome.storage.local.get([STORAGE_KEYS.MASTER_SALT, STORAGE_KEYS.MASTER_VERIFIER]);
  return Boolean(data[STORAGE_KEYS.MASTER_SALT] && data[STORAGE_KEYS.MASTER_VERIFIER]);
}

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

export async function unlockMasterPassword(password) {
  const data = await chrome.storage.local.get([STORAGE_KEYS.MASTER_SALT, STORAGE_KEYS.MASTER_VERIFIER]);
  const saltBase64 = data[STORAGE_KEYS.MASTER_SALT];
  const verifier = data[STORAGE_KEYS.MASTER_VERIFIER];
  if (!saltBase64 || !verifier) return false;

  const key = await deriveKey(password, fromBase64(saltBase64));
  try {
    const plain = await decryptWithKey(key, verifier);
    if (plain !== "vault-ready") return false;
    sessionKey = key;
    return true;
  } catch {
    return false;
  }
}

export function isUnlocked() {
  return Boolean(sessionKey);
}

async function encryptWithKey(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(value));
  return {
    iv: toBase64(iv),
    value: toBase64(new Uint8Array(cipher))
  };
}

async function decryptWithKey(key, payload) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(payload.iv) },
    key,
    fromBase64(payload.value)
  );
  return textDecoder.decode(plain);
}

export async function encryptSecret(value) {
  if (!sessionKey) throw new Error("Vault is locked.");
  return encryptWithKey(sessionKey, value);
}

export async function decryptSecret(payload) {
  if (!sessionKey) throw new Error("Vault is locked.");
  return decryptWithKey(sessionKey, payload);
}
