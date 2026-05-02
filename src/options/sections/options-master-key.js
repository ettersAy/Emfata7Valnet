/**
 * Master Key change module for Options page.
 * Sole responsibility: handle master password change with validation.
 */
import { changeMasterPassword, isMasterPasswordConfigured } from "../../common/crypto.js";
import { t } from "../../common/i18n.js";

/**
 * Handle master key change action with full validation.
 * @param {Object} refs
 * @param {HTMLInputElement} refs.currentInput
 * @param {HTMLInputElement} refs.newInput
 * @param {HTMLInputElement} refs.confirmInput
 * @param {HTMLButtonElement} refs.button
 * @param {HTMLElement} refs.messageEl
 */
export async function onChangeMasterKey(refs) {
  const { currentInput, newInput, confirmInput, button, messageEl } = refs;
  const currentPassword = currentInput.value;
  const newPassword = newInput.value;
  const confirmPassword = confirmInput.value;

  // Clear previous message
  messageEl.textContent = "";
  messageEl.className = "msg";

  // Check if a master password is configured
  const configured = await isMasterPasswordConfigured();
  if (!configured) {
    messageEl.textContent = t("masterKeyChangeFailed");
    messageEl.className = "msg error";
    return;
  }

  // Validate inputs
  if (!currentPassword) {
    messageEl.textContent = t("masterKeyChangeFailed");
    messageEl.className = "msg error";
    return;
  }

  if (!newPassword || newPassword.length < 4) {
    messageEl.textContent = t("minLengthError");
    messageEl.className = "msg error";
    return;
  }

  if (newPassword !== confirmPassword) {
    messageEl.textContent = t("masterKeyMismatch");
    messageEl.className = "msg error";
    return;
  }

  if (newPassword === currentPassword) {
    messageEl.textContent = t("masterKeySamePassword");
    messageEl.className = "msg error";
    return;
  }

  // Disable button during operation
  button.disabled = true;
  button.textContent = "\u23F3 " + t("changeMasterKeyBtn");

  try {
    const success = await changeMasterPassword(currentPassword, newPassword);

    if (success) {
      messageEl.textContent = t("masterKeyChangeSuccess");
      messageEl.className = "msg success";
      // Clear inputs on success
      currentInput.value = "";
      newInput.value = "";
      confirmInput.value = "";
    } else {
      messageEl.textContent = t("masterKeyChangeFailed");
      messageEl.className = "msg error";
    }
  } catch (err) {
    messageEl.textContent = t("masterKeyChangeFailed") + " " + err.message;
    messageEl.className = "msg error";
  } finally {
    button.disabled = false;
    button.textContent = t("changeMasterKeyBtn");
  }
}
