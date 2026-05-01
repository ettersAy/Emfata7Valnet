import {
  isMasterPasswordConfigured,
  isUnlocked,
  setupMasterPassword,
  unlockMasterPassword,
  lockVault as cryptoLock
} from "../common/crypto.js";
import { t } from "../common/i18n.js";

const SESSION_KEYS = {
  MASTER_PASSWORD: "session_master_password",
  UNLOCK_DATE: "session_unlock_date"
};

const domRefs = {};

export function initVault(refs) {
  Object.assign(domRefs, refs);
}

/** Try to auto-unlock using stored session (once per day). */
export async function trySessionAutoUnlock() {
  if (isUnlocked()) return true;

  const today = new Date().toISOString().slice(0, 10);
  const data = await chrome.storage.session.get([
    SESSION_KEYS.MASTER_PASSWORD,
    SESSION_KEYS.UNLOCK_DATE
  ]);

  // Only auto-unlock if the session is from today AND password is stored
  if (data[SESSION_KEYS.UNLOCK_DATE] !== today || !data[SESSION_KEYS.MASTER_PASSWORD]) {
    return false;
  }

  return unlockMasterPassword(data[SESSION_KEYS.MASTER_PASSWORD]);
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

  if (!password || password.length < 4) {
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

  const today = new Date().toISOString().slice(0, 10);
  await chrome.storage.session.set({
    [SESSION_KEYS.MASTER_PASSWORD]: password,
    [SESSION_KEYS.UNLOCK_DATE]: today
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
    SESSION_KEYS.MASTER_PASSWORD,
    SESSION_KEYS.UNLOCK_DATE
  ]);
}

function shakeElement(el) {
  el.style.animation = "none";
  el.offsetHeight; // trigger reflow
  el.style.animation = "shake 0.4s ease";
  setTimeout(() => (el.style.animation = ""), 400);
}
