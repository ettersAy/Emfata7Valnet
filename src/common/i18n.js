/**
 * i18n — Translation module for مفاتيح
 * Supports: Arabic (ar), English (en), French (fr), Spanish (es), Hindi (hi), Chinese (zh)
 *
 * Languages are stored in individual files under src/common/i18n/ for maintainability.
 * Each file exports a flat { key: translation } object.
 */

import ar from "./i18n/ar.js";
import en from "./i18n/en.js";
import fr from "./i18n/fr.js";
import es from "./i18n/es.js";
import hi from "./i18n/hi.js";
import zh from "./i18n/zh.js";

const LANGUAGES = {
  ar: { name: "العربية", dir: "rtl" },
  en: { name: "English", dir: "ltr" },
  fr: { name: "Français", dir: "ltr" },
  es: { name: "Español", dir: "ltr" },
  hi: { name: "हिन्दी", dir: "ltr" },
  zh: { name: "中文", dir: "ltr" },
};

/** Map of language code → translations object */
const ALL_TRANSLATIONS = { ar, en, fr, es, hi, zh };

/* ── Current language ────────────────────────────────────── */
let currentLang = "ar";

/**
 * Get the translated string for a given key.
 * Supports simple {placeholder} replacement.
 * Falls back to Arabic if the current language has no translation for the key.
 * Falls back to the key itself if no translation exists at all.
 */
export function t(key, replacements = {}) {
  const langDict = ALL_TRANSLATIONS[currentLang];
  let text = langDict?.[key] || ALL_TRANSLATIONS["ar"]?.[key] || key;
  if (typeof text !== "string") return text;

  for (const [placeholder, value] of Object.entries(replacements)) {
    text = text.replace(`{${placeholder}}`, value);
  }

  return text;
}

/**
 * Get the display name of a language code.
 */
export function getLanguageName(langCode) {
  return LANGUAGES[langCode]?.name || langCode;
}

/**
 * Get the text direction for the current language.
 */
export function getDirection() {
  return LANGUAGES[currentLang]?.dir || "ltr";
}

/**
 * Get the current language code.
 */
export function getCurrentLanguage() {
  return currentLang;
}

/**
 * Get all supported language codes.
 */
export function getSupportedLanguages() {
  return Object.keys(LANGUAGES);
}

/**
 * Get the language codes with their display names.
 */
export function getLanguages() {
  return LANGUAGES;
}

/**
 * Set the current language and apply to the document.
 */
export async function setLanguage(langCode) {
  if (!LANGUAGES[langCode]) {
    console.warn(`Language "${langCode}" not supported, falling back to Arabic.`);
    langCode = "ar";
  }
  currentLang = langCode;
  applyToDocument();
}

/**
 * Apply current translations to all elements with data-i18n attributes.
 */
export function applyToDocument() {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = getDirection();

  // Translate elements with data-i18n
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.dataset.i18n;
    const replacements = {};
    if (el.dataset.i18nReplace) {
      try { Object.assign(replacements, JSON.parse(el.dataset.i18nReplace)); }
      catch { /* ignore */ }
    }
    for (const attr of el.attributes) {
      if (attr.name.startsWith("data-replace-")) {
        replacements[attr.name.replace("data-replace-", "")] = attr.value;
      }
    }
    el.textContent = t(key, replacements);
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Translate input values
  document.querySelectorAll("[data-i18n-value]").forEach((el) => {
    el.value = t(el.dataset.i18nValue);
  });

  // Translate title attributes
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
}

/**
 * Initialize the i18n system: load saved preference and apply.
 */
export async function initI18n() {
  const data = await chrome.storage.local.get("app_language");
  const savedLang = data.app_language || "ar";
  if (LANGUAGES[savedLang]) {
    currentLang = savedLang;
  }
  applyToDocument();
  return currentLang;
}

/**
 * Save language preference and re-apply translations.
 */
export async function saveAndApplyLanguage(langCode) {
  if (!LANGUAGES[langCode]) return;
  currentLang = langCode;
  await chrome.storage.local.set({ app_language: langCode });
  applyToDocument();
}
