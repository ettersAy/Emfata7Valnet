/**
 * Inline editor module for مفاتيح.
 * Single responsibility: manage the inline editor for quickly adding
 * new credential entries (show, hide, save).
 */
import { encryptSecret } from "../common/crypto.js";
import { createWebsite, createCredential } from "../common/models.js";
import { saveWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount, showToast } from "./popup-render.js";
import { createInlineEditor } from "./popup-dom.js";
import { t } from "../common/i18n.js";

/**
 * Show the inline editor at the top of the site list.
 * @param {Object} dom - DOM refs with siteList
 */
export function showInlineEditor(dom) {
  const existing = document.getElementById("inlineEditor");
  if (!existing.hidden) return;

  // Hide empty state if present
  const emptyState = dom.siteList.querySelector(".empty-state");
  if (emptyState) {
    emptyState.dataset.wasEmpty = "true";
    emptyState.hidden = true;
  }

  const editor = createInlineEditor();
  dom.siteList.prepend(editor);
}

/**
 * Hide the inline editor and restore empty state if needed.
 * @param {Object} dom - DOM refs with siteList
 */
export function hideInlineEditor(dom) {
  const editor = document.getElementById("inlineEditor");
  editor.hidden = true;
  const main = document.querySelector(".app");
  main.appendChild(editor);

  const emptyState = dom.siteList.querySelector(".empty-state[data-was-empty]");
  if (emptyState) {
    emptyState.hidden = false;
    delete emptyState.dataset.wasEmpty;
  }
}

/**
 * Save the inline editor data as a new website entry.
 * @param {Object} dom - DOM refs with siteList, listMessage, entryCount
 */
export async function saveFromInlineEditor(dom) {
  const siteUrl = document.getElementById("inlineSiteUrl").value.trim();
  const login = document.getElementById("inlineLogin").value.trim();
  const password = document.getElementById("inlinePassword").value.trim();

  if (!siteUrl || !login || !password) {
    showToast(dom.listMessage, "Please fill in all fields", "warning");
    return;
  }

  const loginEncrypted = await encryptSecret(login);
  const passwordEncrypted = await encryptSecret(password);

  const credential = createCredential({ loginEncrypted, passwordEncrypted });
  const website = createWebsite({
    url: siteUrl,
    label: siteUrl,
    credentials: [credential],
    order: Date.now()
  });

  popupState.websites.push(website);
  await saveWebsites(popupState.websites);

  hideInlineEditor(dom);
  await renderWebsites(filteredWebsites(), dom.siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, dom.entryCount);
  showToast(dom.listMessage, t("savedSuccess") || "Saved!", "success");
}
