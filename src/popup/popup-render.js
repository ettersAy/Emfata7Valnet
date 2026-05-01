import { createSiteRow, clearElement, createEmptyState } from "./popup-dom.js";
import { t } from "../common/i18n.js";
import { decryptSecret } from "../common/crypto.js";

import { popupState } from "./popup-state.js";

export async function renderWebsites(websites, root) {
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

  for (let index = 0; index < websites.length; index++) {
    const website = websites[index];
    // Pre-decrypt logins for display (non-hidden)
    const decryptedCredentials = [];
    for (const cred of (website.credentials || [])) {
      let login = "";
      if (cred.loginEncrypted) {
        try {
          login = await decryptSecret(cred.loginEncrypted);
        } catch {
          login = "••••••";
        }
      }
      decryptedCredentials.push({
        id: cred.id,
        login,
        passwordEncrypted: cred.passwordEncrypted
      });
    }
    root.appendChild(createSiteRow(website, index, decryptedCredentials));
  }
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
