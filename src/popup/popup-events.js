import { normalizeUrlForOpen } from "../common/models.js";
import { decryptSecret } from "../common/crypto.js";
import { getFieldKeywords, saveWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount, showToast } from "./popup-render.js";
import { openDialog } from "./popup-dialog.js";
import { t } from "../common/i18n.js";


const dom = {};

export function initEvents(refs) {
  Object.assign(dom, refs);
  wireEvents();
}

function wireEvents() {
  const { siteList, searchInput, entryCount } = dom;

  siteList.addEventListener("click", onListClick);
  siteList.addEventListener("dblclick", onListDblClick);
  searchInput.addEventListener("input", onSearch);
}

async function onSearch() {
  const { searchInput, siteList, entryCount } = dom;
  popupState.searchQuery = searchInput.value.trim().toLowerCase();
  await renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
}

async function onListClick(event) {
  const { listMessage, siteList, entryCount } = dom;
  listMessage.hidden = true;
  const row = event.target.closest(".site-row");
  if (!row) return;

  const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
  if (!website) return;

  // Open site
  if (event.target.closest(".open-site")) {
    const normalized = normalizeUrlForOpen(website.url);
    if (!normalized) {
      showToast(listMessage, t("notAValidUrl"), "warning");
      return;
    }
    await chrome.tabs.create({ url: normalized });
    return;
  }

  // Edit
  if (event.target.closest(".edit-site")) {
    openDialog(website);
    return;
  }

  // Delete
  if (event.target.closest(".delete-site")) {
    popupState.websites = popupState.websites.filter((item) => item.id !== website.id);
    await saveWebsites(popupState.websites);
    await renderWebsites(filteredWebsites(), siteList);
    updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
    showToast(listMessage, t("deletedSuccess"), "success");
    return;
  }

  // Lock button — toggle password visibility
  const lockBtn = event.target.closest(".cred-pair__lock");
  if (lockBtn) {
    await handleLockClick(lockBtn, website);
    return;
  }

  // Fill button — autofill inputs (no website check)
  const fillBtn = event.target.closest(".cred-pair__fill");
  if (fillBtn) {
    await handleFillClick(fillBtn, website);
    return;
  }
}

/**
 * Toggle password visibility for a credential.
 */
async function handleLockClick(lockBtn, website) {
  const credId = lockBtn.dataset.credId;
  const cred = (website.credentials || []).find(c => c.id === credId);
  if (!cred || !cred.passwordEncrypted) {
    return;
  }

  // Check if password is already revealed
  const pair = lockBtn.closest(".cred-pair");
  const existingReveal = pair.querySelector(".cred-pair__password-reveal");

  if (existingReveal) {
    // Hide password
    existingReveal.remove();
    lockBtn.textContent = "🔒";
    lockBtn.title = t("showPasswordTitle");
  } else {
    // Decrypt and show password
    try {
      const plain = await decryptSecret(cred.passwordEncrypted);
      const reveal = document.createElement("span");
      reveal.className = "cred-pair__password-reveal";
      reveal.textContent = plain;
      reveal.title = plain;
      pair.insertBefore(reveal, lockBtn.nextSibling);
      lockBtn.textContent = "🔓";
      lockBtn.title = t("hidePasswordTitle");
    } catch {
      // Decryption failed
    }
  }
}

/**
 * Fill credentials into active tab (no website check).
 */
async function handleFillClick(fillBtn, website) {
  const { listMessage } = dom;
  const credId = fillBtn.dataset.credId;
  const cred = (website.credentials || []).find(c => c.id === credId);
  if (!cred || !cred.loginEncrypted || !cred.passwordEncrypted) {
    showToast(listMessage, t("encryptedDataMissing"), "warning");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  let username, password;
  try {
    username = await decryptSecret(cred.loginEncrypted);
    password = await decryptSecret(cred.passwordEncrypted);
  } catch {
    showToast(listMessage, t("decryptionFailed"), "error");
    return;
  }

  await chrome.tabs.sendMessage(tab.id, {
    type: "RUN_AUTOFILL",
    payload: {
      credential: {
        username,
        password
      },
      fieldKeywords: await getFieldKeywords()
    }
  });
  showToast(listMessage, t("autofillSuccess"), "success");
}

async function onListDblClick(event) {
  const { listMessage } = dom;

  // Double-click on site title = copy URL
  const title = event.target.closest(".open-site");
  if (title) {
    const row = event.target.closest(".site-row");
    if (!row) return;
    const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
    if (!website) return;
    await navigator.clipboard.writeText(website.url);
    showCopyIndicator(title);
    showToast(listMessage, t("copiedUrl"), "success");
    return;
  }

  // Double-click on login text in credential pair = copy login
  const loginSpan = event.target.closest(".cred-pair__login");
  if (loginSpan) {
    await navigator.clipboard.writeText(loginSpan.textContent);
    showCopyIndicator(loginSpan);
    showToast(listMessage, t("copiedUsername"), "success");
    return;
  }
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
