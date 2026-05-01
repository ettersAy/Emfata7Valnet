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

export function lockVault() {
  sessionKey = null;
}

async function encryptWithKey(key, value) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, textEncoder.encode(value));
  return {
    iv: toBase64(iv),
    value: toBase64(new Uint8Array(cipher))
  };
}

/**
 * Normalize an encrypted payload that may be in old string format ("iv:value")
 * to the current object format ({ iv, value }).
 */
function normalizePayload(payload) {
  if (!payload) return null;
  // Already an object with required properties
  if (typeof payload === "object" && payload.iv && payload.value) {
    return payload;
  }
  // Old string format: "base64Iv:base64Value"
  if (typeof payload === "string" && payload.includes(":")) {
    const [iv, value] = payload.split(":");
    if (iv && value) {
      return { iv, value };
    }
  }
  return null;
}

async function decryptWithKey(key, payload) {
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

export async function encryptSecret(value) {
  if (!sessionKey) throw new Error("Vault is locked.");
  return encryptWithKey(sessionKey, value);
}

export async function decryptSecret(payload) {
  if (!sessionKey) throw new Error("Vault is locked.");
  return decryptWithKey(sessionKey, payload);
}

/**
 * Change the master password by:
 * 1. Verifying the old password
 * 2. Decrypting all existing website credentials with the old key
 * 3. Generating a new salt and deriving a new key from the new password
 * 4. Re-encrypting all credentials with the new key
 * 5. Updating the stored salt, verifier, and session key
 *
 * @param {string} oldPassword - Current master password
 * @param {string} newPassword - New master password
 * @returns {Promise<boolean>} True if the password was changed successfully
 */
export async function changeMasterPassword(oldPassword, newPassword) {
  // 1. Verify old password (this sets sessionKey to the old key on success)
  const unlocked = await unlockMasterPassword(oldPassword);
  if (!unlocked) return false;

  // 2. Get all websites from storage and decrypt credentials with old key
  const { [STORAGE_KEYS.WEBSITES]: websites } = await chrome.storage.local.get(STORAGE_KEYS.WEBSITES);
  const decryptedSites = (websites || []).map(site => ({
    ...site,
    _decryptedCreds: (site.credentials || []).map(cred => ({
      id: cred.id,
      login: cred.loginEncrypted ? decryptSecret(cred.loginEncrypted) : Promise.resolve(null),
      password: cred.passwordEncrypted ? decryptSecret(cred.passwordEncrypted) : Promise.resolve(null)
    }))
  }));

  // Resolve all decryption promises
  for (const site of decryptedSites) {
    for (const cred of site._decryptedCreds) {
      try {
        cred.login = await cred.login;
      } catch {
        cred.login = null;
      }
      try {
        cred.password = await cred.password;
      } catch {
        cred.password = null;
      }
    }
  }

  // 3. Generate new salt and derive new key
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  const newKey = await deriveKey(newPassword, newSalt);

  // 4. Temporarily store session key for re-encryption, then update to new key
  const newVerifier = await encryptWithKey(newKey, "vault-ready");
  sessionKey = newKey;

  // 5. Store new salt and verifier
  await chrome.storage.local.set({
    [STORAGE_KEYS.MASTER_SALT]: toBase64(newSalt),
    [STORAGE_KEYS.MASTER_VERIFIER]: newVerifier
  });

  // 6. Re-encrypt all credentials with new key
  const reencryptedSites = decryptedSites.map(site => {
    const newCredentials = site._decryptedCreds.map(cred => ({
      id: cred.id,
      loginEncrypted: cred.login ? encryptSecret(cred.login) : Promise.resolve(null),
      passwordEncrypted: cred.password ? encryptSecret(cred.password) : Promise.resolve(null)
    }));
    // Resolve encryption promises
    return Promise.all(newCredentials).then(creds => {
      const { _decryptedCreds, ...cleanSite } = site;
      cleanSite.credentials = creds;
      return cleanSite;
    });
  });

  const finalWebsites = await Promise.all(reencryptedSites);

  // 7. Save re-encrypted websites back to storage
  await chrome.storage.local.set({ [STORAGE_KEYS.WEBSITES]: finalWebsites });

  // 8. Update the session-stored master password so auto-unlock still works
  try {
    const today = new Date().toISOString().slice(0, 10);
    await chrome.storage.session.set({
      session_master_password: newPassword,
      session_unlock_date: today
    });
  } catch {
    // Ignore — session storage may not be available on this page
  }

  return true;
}
