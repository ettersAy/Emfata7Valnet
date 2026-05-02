/**
 * Field Keywords settings module for Options page.
 * Sole responsibility: manage user/password field keyword settings.
 */
import { DEFAULT_FIELD_KEYWORDS } from "../../common/constants.js";
import { getFieldKeywords, saveFieldKeywords } from "../../common/storage.js";
import { t } from "../../common/i18n.js";

/**
 * Load keyword settings into DOM elements.
 * @param {HTMLTextAreaElement} userTextarea
 * @param {HTMLTextAreaElement} passwordTextarea
 * @param {HTMLElement} userPreview
 * @param {HTMLElement} passwordPreview
 */
export async function loadKeywords(userTextarea, passwordTextarea, userPreview, passwordPreview) {
  const settings = await getFieldKeywords();
  userTextarea.value = settings.user.join(", ");
  passwordTextarea.value = settings.password.join(", ");
  renderChips(userTextarea.value, userPreview);
  renderChips(passwordTextarea.value, passwordPreview);
}

/**
 * Handle save keywords action.
 * @param {HTMLTextAreaElement} userTextarea
 * @param {HTMLTextAreaElement} passwordTextarea
 * @param {HTMLElement} messageEl
 */
export async function onSaveKeywords(userTextarea, passwordTextarea, messageEl) {
  const next = {
    user: parseKeywords(userTextarea.value, DEFAULT_FIELD_KEYWORDS.user),
    password: parseKeywords(passwordTextarea.value, DEFAULT_FIELD_KEYWORDS.password)
  };
  await saveFieldKeywords(next);
  messageEl.textContent = t("saveSuccess");
  messageEl.className = "success";
  setTimeout(() => {
    messageEl.textContent = "";
    messageEl.className = "";
  }, 2500);
}

/**
 * Render comma-separated keywords as chip elements.
 * @param {string} raw
 * @param {HTMLElement} container
 */
export function renderChips(raw, container) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  container.innerHTML = "";
  words.forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = word;
    container.appendChild(chip);
  });
}

function parseKeywords(raw, fallback) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return words.length ? Array.from(new Set(words)) : fallback;
}
