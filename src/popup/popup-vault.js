import {
  isMasterPasswordConfigured,
  isUnlocked,
  setupMasterPassword,
  unlockMasterPassword,
  lockVault as cryptoLock
} from "../common/crypto.js";
import { t } from "../common/i18n.js";

const SESSION_KEYS = {
  UNLOCK_DATE: "session_unlock_date",
  UNLOCK_TIMESTAMP: "session_unlock_timestamp"
};

// Maximum session duration: 60 minutes before forced re-lock
const MAX_SESSION_MINUTES = 60;

const domRefs = {};

export function initVault(refs) {
  Object.assign(domRefs, refs);
}

/**
 * Try to auto-unlock using the in-memory session key.
 * The CryptoKey persists in JS heap as long as the service worker /
 * popup context hasn't been terminated. We only auto-unlock if the
 * key is still alive AND the unlock is from today.
 *
 * The raw master password is NEVER persisted to any storage.
 */
export async function trySessionAutoUnlock() {
  // If the in-memory key is still alive, check the session timeout
  if (isUnlocked()) {
    const data = await chrome.storage.session.get([SESSION_KEYS.UNLOCK_TIMESTAMP]);
    const unlockTime = data[SESSION_KEYS.UNLOCK_TIMESTAMP];
    if (unlockTime) {
      const elapsed = Date.now() - unlockTime;
      if (elapsed > MAX_SESSION_MINUTES * 60 * 1000) {
        // Session expired — force lock
        await lockVault();
        return false;
      }
    }
    return true;
  }

  // If the key was evicted (context restart), we must re-prompt.
  const today = new Date().toISOString().slice(0, 10);
  const data = await chrome.storage.session.get([SESSION_KEYS.UNLOCK_DATE]);

  // If there's no unlock date for today, the user must re-enter the password.
  if (data[SESSION_KEYS.UNLOCK_DATE] !== today) {
    return false;
  }

  // The CryptoKey is gone — force manual unlock.
  return false;
}

/** Bootstrap the vault gate UI (configured vs new user). */
export async function bootstrapVaultGate() {
  const configured = await isMasterPasswordConfigured();
  const { vaultHint, passwordStrength, unlockBtn } = domRefs;

  vaultHint.textContent = configured
    ? t("vaultHintConfigured")
    : t("vaultHintNew");

  if (configured) {
    passwordStrength.hidden = true;
    unlockBtn.textContent = t("unlockBtn");
  } else {
    passwordStrength.hidden = false;
    unlockBtn.textContent = t("createVaultBtn");
  }
}

/** Handle unlock or first-time setup. Returns true on success. */
export async function handleUnlock() {
  const { masterPasswordInput, vaultGate, vaultMessage } = domRefs;
  const password = masterPasswordInput.value;

  if (!password || password.length < 12) {
    vaultMessage.textContent = t("minLengthError");
    return false;
  }

  const configured = await isMasterPasswordConfigured();
  const success = configured
    ? await unlockMasterPassword(password)
    : await setupMasterPassword(password).then(() => true);

  if (!success) {
    vaultMessage.textContent = t("invalidMasterPassword");
    shakeElement(vaultGate);
    return false;
  }

  // Only store unlock metadata — the raw master password is NEVER persisted.
  const today = new Date().toISOString().slice(0, 10);
  await chrome.storage.session.set({
    [SESSION_KEYS.UNLOCK_DATE]: today,
    [SESSION_KEYS.UNLOCK_TIMESTAMP]: Date.now()
  });

  masterPasswordInput.value = "";
  vaultMessage.textContent = t("vaultUnlocked");
  vaultMessage.style.color = "var(--success)";
  return true;
}

/** Lock the vault: clear session key and session storage. */
export async function lockVault() {
  cryptoLock();
  await chrome.storage.session.remove([
    SESSION_KEYS.UNLOCK_DATE,
    SESSION_KEYS.UNLOCK_TIMESTAMP
  ]);
}

function shakeElement(el) {
  el.style.animation = "none";
  el.offsetHeight; // trigger reflow
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => (el.style.animation = ""), 400);
}
