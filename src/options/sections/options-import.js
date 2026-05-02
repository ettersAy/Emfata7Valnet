/**
 * Import module for Options page.
 * Sole responsibility: import vault data from JSON or CSV files.
 */
import { saveWebsites } from "../../common/storage.js";
import { t } from "../../common/i18n.js";
import { csvToWebsites } from "./options-csv.js";

/**
 * Handle file import action.
 * @param {HTMLInputElement} fileInput
 * @param {HTMLElement} messageEl
 */
export async function onImport(fileInput, messageEl) {
  const file = fileInput.files[0];
  if (!file) {
    messageEl.textContent = t("importNoFile");
    messageEl.className = "msg error";
    return;
  }

  try {
    const text = await file.text();
    let websites = [];

    if (file.name.endsWith(".json")) {
      const data = JSON.parse(text);
      websites = data.websites || [];
    } else if (file.name.endsWith(".csv")) {
      websites = csvToWebsites(text);
    } else {
      throw new Error(t("importInvalidFormat"));
    }

    if (!websites.length) {
      messageEl.textContent = t("importNoValidData");
      messageEl.className = "msg error";
      return;
    }

    // Size limit: reject files > 10 MB
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(t("importFileTooLarge") || "File is too large (max 10 MB).");
    }

    // Entry count limit
    const MAX_ENTRIES = 10000;
    if (websites.length > MAX_ENTRIES) {
      throw new Error(t("importTooManyEntries") || `Too many entries (max ${MAX_ENTRIES}).`);
    }

    // Validate each entry has required fields and no duplicate IDs
    const seenIds = new Set();
    for (const w of websites) {
      if (!w.id || !w.url) {
        throw new Error(t("importInvalidEntry"));
      }
      if (seenIds.has(w.id)) {
        throw new Error(t("importDuplicateId") || "Duplicate entry ID found.");
      }
      seenIds.add(w.id);
      // Validate credential structure
      if (w.credentials && Array.isArray(w.credentials)) {
        for (const cred of w.credentials) {
          if (!cred.id || (!cred.loginEncrypted && !cred.passwordEncrypted)) {
            throw new Error(t("importInvalidCredential") || "Invalid credential entry.");
          }
        }
      }
    }

    await saveWebsites(websites);
    messageEl.textContent = t("importSuccess", { count: websites.length });
    messageEl.className = "msg success";

    // Reset file input
    fileInput.value = "";
  } catch (err) {
    messageEl.textContent = t("importFailed", { message: err.message });
    messageEl.className = "msg error";
  }
}
