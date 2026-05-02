/**
 * Export module for Options page.
 * Sole responsibility: export vault data as JSON or CSV.
 */
import { getWebsites } from "../../common/storage.js";
import { t } from "../../common/i18n.js";
import { websitesToCsv } from "./options-csv.js";

/**
 * Export websites data in the specified format.
 * @param {"json"|"csv"} format
 * @param {HTMLElement} messageEl
 */
export async function exportData(format, messageEl) {
  try {
    const websites = await getWebsites();
    if (!websites.length) {
      messageEl.textContent = t("exportNoData");
      messageEl.className = "msg error";
      return;
    }

    // Security warning: exported file contains encrypted credentials
    const confirmed = confirm(t("exportSecurityWarning"));
    if (!confirmed) return;

    const exportPayload = {
      version: "0.2.0",
      exportedAt: new Date().toISOString(),
      websites
    };

    let blob, filename;
    if (format === "json") {
      blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      filename = `mafati7-export-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      const csv = websitesToCsv(websites);
      blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      filename = `mafati7-export-${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    messageEl.textContent = t("exportSuccess", { count: websites.length });
    messageEl.className = "msg success";
  } catch (err) {
    messageEl.textContent = t("exportFailed", { message: err.message });
    messageEl.className = "msg error";
  }
}
