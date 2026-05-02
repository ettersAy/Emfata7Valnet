/**
 * Password strength evaluation module for مفاتيح.
 * Single responsibility: evaluate password strength and return
 * a label and strength level for the UI strength meter.
 */
import { t } from "../common/i18n.js";

/**
 * Evaluate password strength based on length, character variety.
 * @param {string} password
 * @returns {{strength: string, label: string}}
 */
export function evaluateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { strength: "weak", label: t("strengthWeak") };
  if (score === 2) return { strength: "fair", label: t("strengthFair") };
  if (score === 3) return { strength: "good", label: t("strengthGood") };
  return { strength: "strong", label: t("strengthStrong") };
}

/**
 * Wire the password strength meter to a password input.
 * @param {HTMLInputElement} inputEl
 * @param {HTMLElement} strengthContainer
 * @param {HTMLElement} strengthFill
 * @param {HTMLElement} strengthLabel
 */
export function wirePasswordStrength(inputEl, strengthContainer, strengthFill, strengthLabel) {
  inputEl.addEventListener("input", () => {
    const val = inputEl.value;
    if (!val) {
      strengthContainer.hidden = true;
      return;
    }
    strengthContainer.hidden = false;
    const { strength, label } = evaluateStrength(val);
    strengthFill.className = `strength-fill ${strength}`;
    strengthLabel.textContent = label;
  });
}
