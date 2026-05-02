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

    // Validate each entry has required fields
    for (const w of websites) {
      if (!w.id || !w.url) {
        throw new Error(t("importInvalidEntry"));
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
