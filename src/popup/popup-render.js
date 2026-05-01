import { createSiteRow, clearElement, createEmptyState } from "./popup-dom.js";
import { popupState } from "./popup-state.js";

export function renderWebsites(websites, root) {
  clearElement(root);

  if (!websites.length) {
    root.appendChild(
      createEmptyState(
        "انقر على زر + أعلاه لإضافة أول كلمة مرور.",
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
    countEl.textContent = `${total} مدخلات`;
  } else {
    countEl.textContent = `${visible} / ${total}`;
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
