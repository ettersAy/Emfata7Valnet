/**
 * Options page — Orchestrator module.
 * Wires together focused sub-modules, each with a single responsibility.
 */
import { initI18n, t } from "../common/i18n.js";
import { isUnlocked } from "../common/crypto.js";
import { populateLanguageSelector, onLanguageChange } from "./sections/options-language.js";
import { loadKeywords, onSaveKeywords, renderChips } from "./sections/options-keywords.js";
import { exportData } from "./sections/options-export.js";
import { onImport } from "./sections/options-import.js";
import { onChangeMasterKey } from "./sections/options-master-key.js";

/**
 * If the vault is locked, disable sensitive operations (export, import, change key)
 * and show an unlock-required warning.
 */
function gateSensitiveSections() {
  if (isUnlocked()) return;

  const sensitiveSelectors = [
    "#changeMasterKeyBtn",
    "#currentMasterKey",
    "#newMasterKey",
    "#confirmMasterKey",
    "#exportJson",
    "#exportCsv",
    "#importBtn",
    "#importFile"
  ];

  for (const sel of sensitiveSelectors) {
    const el = document.querySelector(sel);
    if (el) el.disabled = true;
  }

  // Show unlock-required notice
  const msg = document.createElement("p");
  msg.className = "msg warning";
  msg.textContent = t("settingsUnlockRequired") || "⚠ Unlock the vault first from the extension popup.";
  msg.id = "unlockRequiredMsg";
  const header = document.querySelector("header");
  if (header) header.after(msg);
}

/* ── DOM refs ───────────────────────────────────────────── */
const dom = {
  // Keywords
  userKeywords: document.getElementById("userKeywords"),
  passwordKeywords: document.getElementById("passwordKeywords"),
  saveMessage: document.getElementById("saveMessage"),
  userPreview: document.getElementById("userKeywordPreview"),
  passwordPreview: document.getElementById("passwordKeywordPreview"),

  // Export
  exportJson: document.getElementById("exportJson"),
  exportCsv: document.getElementById("exportCsv"),
  exportMessage: document.getElementById("exportMessage"),

  // Import
  importFile: document.getElementById("importFile"),
  importBtn: document.getElementById("importBtn"),
  importMessage: document.getElementById("importMessage"),

  // Language
  languageSelect: document.getElementById("languageSelect"),

  // Master key
  currentMasterKeyInput: document.getElementById("currentMasterKey"),
  newMasterKeyInput: document.getElementById("newMasterKey"),
  confirmMasterKeyInput: document.getElementById("confirmMasterKey"),
  changeMasterKeyBtn: document.getElementById("changeMasterKeyBtn"),
  masterKeyMessage: document.getElementById("masterKeyMessage"),
};

/* ── Wire events ────────────────────────────────────────── */
document.getElementById("saveSettings").addEventListener("click", () =>
  onSaveKeywords(dom.userKeywords, dom.passwordKeywords, dom.saveMessage)
);

dom.userKeywords.addEventListener("input", () =>
  renderChips(dom.userKeywords.value, dom.userPreview)
);
dom.passwordKeywords.addEventListener("input", () =>
  renderChips(dom.passwordKeywords.value, dom.passwordPreview)
);

dom.exportJson.addEventListener("click", () =>
  exportData("json", dom.exportMessage)
);
dom.exportCsv.addEventListener("click", () =>
  exportData("csv", dom.exportMessage)
);

dom.importBtn.addEventListener("click", () =>
  onImport(dom.importFile, dom.importMessage)
);

dom.languageSelect.addEventListener("change", () =>
  onLanguageChange(dom.languageSelect, dom.saveMessage)
);

dom.changeMasterKeyBtn.addEventListener("click", () =>
  onChangeMasterKey({
    currentInput: dom.currentMasterKeyInput,
    newInput: dom.newMasterKeyInput,
    confirmInput: dom.confirmMasterKeyInput,
    button: dom.changeMasterKeyBtn,
    messageEl: dom.masterKeyMessage,
  })
);

/* ── Initialize ─────────────────────────────────────────── */
const currentLang = await initI18n();
gateSensitiveSections();
populateLanguageSelector(dom.languageSelect, currentLang);
await loadKeywords(dom.userKeywords, dom.passwordKeywords, dom.userPreview, dom.passwordPreview);
