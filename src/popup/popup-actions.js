/**
 * Popup action handlers for مفاتيح.
 * Single responsibility: implement action logic triggered by event handlers
 * (lock toggle, fill, minimize, copy-to-clipboard, open site, delete).
 */
import { normalizeUrlForOpen, getDisplayUrl } from "../common/models.js";
import { decryptSecret } from "../common/crypto.js";
import { getFieldKeywords, saveWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount, showToast } from "./popup-render.js";
import { openDialog } from "./popup-dialog.js";
import { t } from "../common/i18n.js";

/**
 * Open a website URL in a new tab or copy label for text entries.
 * @param {Object} website
 * @param {HTMLElement} openTrigger - The clicked open button element
 * @param {Object} dom - DOM refs with listMessage
 */
export async function handleOpenSite(website, openTrigger, dom) {
  const { listMessage } = dom;

  // For text/app entries: copy the label to clipboard
  const type = openTrigger.dataset.type || website.type;
  if (type === "text") {
    await handleCopy(website.url, openTrigger, dom, "copiedUrl");
    return;
  }

  // For URL entries: open in new tab
  const normalized = normalizeUrlForOpen(website.url);
  if (!normalized) {
    showToast(listMessage, t("notAValidUrl"), "warning");
    return;
  }
  await chrome.tabs.create({ url: normalized });
}

/**
 * Open the edit dialog for a website.
 * @param {Object} website
 */
export function handleEditSite(website) {
  openDialog(website);
}

/**
 * Delete a website entry.
 * @param {Object} website
 * @param {Object} dom - DOM refs
 */
export async function handleDeleteSite(website, dom) {
  const { listMessage, siteList, entryCount } = dom;
  popupState.websites = popupState.websites.filter((item) => item.id !== website.id);
  await saveWebsites(popupState.websites);
  await renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
  showToast(listMessage, t("deletedSuccess"), "success");
}

/**
 * Toggle password visibility for a credential.
 * @param {HTMLElement} lockBtn
 * @param {Object} website
 */
export async function handleLockClick(lockBtn, website) {
  const credId = lockBtn.dataset.credId;
  const cred = (website.credentials || []).find(c => c.id === credId);
  if (!cred || !cred.passwordEncrypted) return;

  const pair = lockBtn.closest(".cred-pair");
  const existingReveal = pair.querySelector(".cred-pair__password-reveal");

  if (existingReveal) {
    existingReveal.remove();
    lockBtn.textContent = "\uD83D\uDD12";
    lockBtn.title = t("showPasswordTitle");
  } else {
    try {
      const plain = await decryptSecret(cred.passwordEncrypted);
      const reveal = document.createElement("span");
      reveal.className = "cred-pair__password-reveal";
      reveal.textContent = plain;
      // No title — password must never appear in a tooltip.
      pair.insertBefore(reveal, lockBtn.nextSibling);
      lockBtn.textContent = "\uD83D\uDD13";
      lockBtn.title = t("hidePasswordTitle");
    } catch {
      // Decryption failed
    }
  }
}

/**
 * Fill credentials into the active browser tab.
 * @param {HTMLElement} fillBtn
 * @param {Object} website
 * @param {Object} dom - DOM refs with listMessage
 */
export async function handleFillClick(fillBtn, website, dom) {
  const { listMessage } = dom;
  const credId = fillBtn.dataset.credId;
  const cred = (website.credentials || []).find(c => c.id === credId);
  if (!cred || !cred.loginEncrypted || !cred.passwordEncrypted) {
    showToast(listMessage, t("encryptedDataMissing"), "warning");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  // Per-fill confirmation for untrusted sites (client-side UX)
  const storedHost = new URL(
    /^https?:\/\//i.test(website.url) ? website.url : `https://${website.url}`
  ).hostname.replace(/^www\./, "");
  const { trusted_sites: trustedSites = [] } = await chrome.storage.local.get("trusted_sites");

  if (!trustedSites.includes(storedHost)) {
    const confirmed = confirm(
      t("fillConfirmation", { hostname: storedHost }) ||
      `Autofill credentials on ${storedHost}?`
    );
    if (!confirmed) return;

    // Remember this site as trusted
    trustedSites.push(storedHost);
    await chrome.storage.local.set({ trusted_sites: trustedSites });
  }

  // Delegate to the service worker for hostname verification, decryption, and fill
  const response = await chrome.runtime.sendMessage({
    type: "AUTOFILL_REQUEST",
    payload: {
      tabId: tab.id,
      websiteUrl: website.url,
      loginEncrypted: cred.loginEncrypted,
      passwordEncrypted: cred.passwordEncrypted
    }
  });

  if (response?.success) {
    showToast(listMessage, t("autofillSuccess"), "success");
  } else if (response?.error === "hostname_mismatch") {
    showToast(listMessage, t("hostMismatch"), "warning");
  } else {
    showToast(listMessage, t("decryptionFailed"), "error");
  }
}

/**
 * Minimize a site row to the bottom section.
 * @param {HTMLElement} row
 * @param {Object} website
 */
export function handleMinimize(row, website) {
  let minimizedList = document.getElementById("minimizedList");
  if (!minimizedList) return;

  const chip = document.createElement("span");
  chip.className = "minimized-site";
  chip.dataset.websiteId = website.id;
  chip.dataset.minimized = "true";
  chip.textContent = ` ${getDisplayUrl(website.url)}`;

  const hint = document.createElement("span");
  hint.className = "minimized-site__restore-hint";
  hint.textContent = " (dbl-click to restore)";
  chip.appendChild(hint);

  minimizedList.appendChild(chip);
  minimizedList.hidden = false;
  row.remove();
}

/**
 * Restore a minimized site chip to the full list.
 * @param {HTMLElement} minimizedChip
 * @param {Object} dom - DOM refs
 */
export async function handleRestoreMinimized(minimizedChip, dom) {
  const websiteId = minimizedChip.dataset.websiteId;
  const website = popupState.websites.find((w) => w.id === websiteId);
  if (!website) {
    minimizedChip.remove();
    return;
  }
  await renderWebsites(filteredWebsites(), dom.siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, dom.entryCount);

  const minimizedList = document.getElementById("minimizedList");
  if (minimizedList) {
    minimizedList.innerHTML = "";
    minimizedList.hidden = true;
  }
}

/**
 * Copy text to clipboard and show a toast.
 * @param {string} text
 * @param {HTMLElement} originEl - Element to show copy indicator on
 * @param {Object} dom - DOM refs with listMessage
 * @param {string} toastKey - i18n key for the toast message
 */
let clipboardTimer = null;

export async function handleCopy(text, originEl, dom, toastKey) {
  const { listMessage } = dom;
  await navigator.clipboard.writeText(text);
  showCopyIndicator(originEl);
  showToast(listMessage, t(toastKey), "success");

  // Clear clipboard after 30 seconds
  clearTimeout(clipboardTimer);
  clipboardTimer = setTimeout(async () => {
    try {
      const current = await navigator.clipboard.readText();
      if (current === text) {
        await navigator.clipboard.writeText("");
      }
    } catch { /* clipboard may be inaccessible */ }
  }, 30000);
}

function showCopyIndicator(el) {
  let indicator = el.querySelector(".copy-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "copy-indicator";
    indicator.textContent = t("copied");
    el.appendChild(indicator);
  }
  indicator.classList.add("show");
  setTimeout(() => indicator.classList.remove("show"), 1500);
}
