import { createSiteRow, clearElement, createEmptyState } from "./popup-dom.js";
import { t } from "../common/i18n.js";

import { popupState } from "./popup-state.js";

export function renderWebsites(websites, root) {
  clearElement(root);

  if (!websites.length) {
    root.appendChild(
      createEmptyState(
        t("emptyStateMessage"),
        "🗄️"
      )
    );
    return;
  }

  websites.forEach((website, index) => {
    root.appendChild(createSiteRow(website, index));
  });
}

export function updateEntryCount(total, visible, countEl) {
  if (total === visible) {
    countEl.textContent = t("entriesCount", { count: total });
  } else {
    countEl.textContent = t("entriesCountFiltered", { visible, total });
  }
}

export function showToast(listMessage, message, type = "muted") {
  listMessage.textContent = message;
  listMessage.hidden = false;
  listMessage.style.color =
    type === "success" ? "var(--success)" :
    type === "warning" ? "var(--warning)" : "var(--text-muted)";

  clearTimeout(popupState._toastTimer);
  popupState._toastTimer = setTimeout(() => {
    listMessage.hidden = true;
  }, 2500);
}
