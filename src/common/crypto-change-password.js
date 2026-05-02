/**
 * Master password change module for مفاتيح.
 * Single responsibility: orchestrate changing the master password,
 * including re-encrypting all stored credentials with the new key.
 */
import { STORAGE_KEYS } from "./constants.js";
import { deriveKey, encryptWithKey, toBase64 } from "./crypto-base.js";
import { unlockMasterPassword, setSessionKey, getSessionKey } from "./crypto-vault.js";
import { encryptSecret, decryptSecret } from "./crypto-secrets.js";

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
      try { cred.login = await cred.login; }
      catch { cred.login = null; }
      try { cred.password = await cred.password; }
      catch { cred.password = null; }
    }
  }

  // 3. Generate new salt and derive new key
  const newSalt = crypto.getRandomValues(new Uint8Array(16));
  const newKey = await deriveKey(newPassword, newSalt);

  // 4. Create new verifier and update session key
  const newVerifier = await encryptWithKey(newKey, "vault-ready");
  setSessionKey(newKey);

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
