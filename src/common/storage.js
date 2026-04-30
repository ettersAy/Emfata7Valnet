import { DEFAULT_FIELD_KEYWORDS, STORAGE_KEYS } from "./constants.js";

export async function getWebsites() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.WEBSITES);
  return data[STORAGE_KEYS.WEBSITES] ?? [];
}

export async function saveWebsites(websites) {
  await chrome.storage.local.set({ [STORAGE_KEYS.WEBSITES]: websites });
}

export async function getFieldKeywords() {
  const data = await chrome.storage.local.get(STORAGE_KEYS.FIELD_KEYWORDS);
  return data[STORAGE_KEYS.FIELD_KEYWORDS] ?? DEFAULT_FIELD_KEYWORDS;
}

export async function saveFieldKeywords(fieldKeywords) {
  await chrome.storage.local.set({ [STORAGE_KEYS.FIELD_KEYWORDS]: fieldKeywords });
}
