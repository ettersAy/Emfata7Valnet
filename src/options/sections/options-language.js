/**
 * Language selector module for Options page.
 * Sole responsibility: manage the language selector UI.
 */
import { t, getLanguages, saveAndApplyLanguage } from "../../common/i18n.js";

/**
 * Populate the language selector dropdown.
 * @param {HTMLSelectElement} selectEl
 * @param {string} selected - Currently selected language code
 */
export function populateLanguageSelector(selectEl, selected) {
  const languages = getLanguages();
  selectEl.innerHTML = "";
  for (const [code, info] of Object.entries(languages)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = info.name;
    if (code === selected) {
      option.selected = true;
    }
    selectEl.appendChild(option);
  }
}

/**
 * Handle language change event.
 * @param {HTMLSelectElement} selectEl
 * @param {HTMLElement} [saveMessageEl] - Optional element to update with success text
 */
export async function onLanguageChange(selectEl, saveMessageEl) {
  const newLang = selectEl.value;
  await saveAndApplyLanguage(newLang);
  populateLanguageSelector(selectEl, newLang);
  if (saveMessageEl && saveMessageEl.textContent) {
    saveMessageEl.textContent = t("saveSuccess");
  }
}
