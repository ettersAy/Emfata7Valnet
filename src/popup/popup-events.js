import { normalizeUrlForOpen, getDisplayUrl } from "../common/models.js";
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

/**
 * Wire all DOM event listeners.
 *
 * ── Event Delegation Architecture ──
 *
 * This popup uses a container-based event delegation pattern:
 *
 *   - Event listeners are attached to specific container elements
 *     (e.g. `siteList`, `searchInput`), not to the global `document`.
 *   - Delegation works by using `event.target.closest(selector)` inside
 *     the handler to identify the originating child element.
 *   - **IMPORTANT: Event delegation does NOT cross container boundaries.**
 *     Events that originate from children of one container do NOT bubble
 *     to listeners on a different container, even if both are siblings
 *     under the same parent.
 *
 * ── Impact ──
 *
 * If a new DOM container is added (like `#minimizedList`), it MUST have
 * its own listeners explicitly attached here in `wireEvents()`. Those
 * listeners can reuse shared handler functions (e.g. `onListDblClick`),
 * but the `.addEventListener()` call itself must be made per-container.
 *
 * @see popup.html for the sibling containers: #websiteList, #minimizedList
 */
function wireEvents() {
  const { siteList, searchInput, entryCount } = dom;

  siteList.addEventListener("click", onListClick);
  siteList.addEventListener("dblclick", onListDblClick);
  searchInput.addEventListener("input", onSearch);

  // ── Separate container: #minimizedList ──
  // This sits outside #websiteList in the DOM, so listeners on siteList
  // will NOT catch events from minimized chips. Attach explicitly here.
  const minimizedList = document.getElementById("minimizedList");
  if (minimizedList) {
    minimizedList.addEventListener("dblclick", onListDblClick);
  }
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

  // Minimize button
  if (event.target.closest(".minimize-site")) {
    handleMinimize(row, website);
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

/**
 * Minimize a site row — move it to the minimized section at the bottom.
 */
function handleMinimize(row, website) {
  const { siteList } = dom;
  let minimizedList = document.getElementById("minimizedList");
  if (!minimizedList) return;

  // Create a minimized chip element
  const chip = document.createElement("span");
  chip.className = "minimized-site";
  chip.dataset.websiteId = website.id;
  chip.dataset.minimized = "true";
  chip.textContent = ` ${getDisplayUrl(website.url)}`;

  // Add a restore hint
  const hint = document.createElement("span");
  hint.className = "minimized-site__restore-hint";
  hint.textContent = " (dbl-click to restore)";
  chip.appendChild(hint);

  minimizedList.appendChild(chip);
  minimizedList.hidden = false;

  // Remove from main list
  row.remove();
}

async function onListDblClick(event) {
  const { listMessage } = dom;

  // Double-click on minimized chip = restore
  const minimizedChip = event.target.closest(".minimized-site");
  if (minimizedChip) {
    const websiteId = minimizedChip.dataset.websiteId;
    const website = popupState.websites.find((w) => w.id === websiteId);
    if (!website) {
      minimizedChip.remove();
      return;
    }
    // Re-render everything to restore the full row
    const { renderWebsites, updateEntryCount } = await import("./popup-render.js");
    const { filteredWebsites } = await import("./popup-state.js");
    await renderWebsites(filteredWebsites(), dom.siteList);
    updateEntryCount(popupState.websites.length, filteredWebsites().length, dom.entryCount);
    // Remove all minimized chips
    const minimizedList = document.getElementById("minimizedList");
    if (minimizedList) {
      minimizedList.innerHTML = "";
      minimizedList.hidden = true;
    }
    return;
  }

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
