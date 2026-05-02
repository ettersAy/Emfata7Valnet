import { createCredential } from "../common/models.js";
import { encryptSecret } from "../common/crypto.js";
import { saveWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount, showToast } from "./popup-render.js";
import { createInlineCredentialAdder } from "./popup-dom.js";
import {
  handleOpenSite,
  handleEditSite,
  handleDeleteSite,
  handleLockClick,
  handleFillClick,
  handleMinimize,
  handleRestoreMinimized,
  handleCopy
} from "./popup-actions.js";
import { t } from "../common/i18n.js";

/**
 * Popup event delegation module for مفاتيح.
 * Single responsibility: wire DOM event listeners and route events
 * to the appropriate action handlers in popup-actions.js.
 *
 * ── Event Delegation Architecture ──
 * Events are caught on container elements (not individual children).
 * Use event.target.closest(selector) to identify the originating element.
 * Delegation does NOT cross container boundaries.
 *
 * ── Routing ──
 * onListClick() identifies button type via CSS class selectors and
 * delegates to the corresponding handler in popup-actions.js.
 */

const dom = {};

export function initEvents(refs) {
  Object.assign(dom, refs);
  wireEvents();
}

function wireEvents() {
  const { siteList, searchInput } = dom;

  siteList.addEventListener("click", onListClick);
  siteList.addEventListener("dblclick", onListDblClick);
  searchInput.addEventListener("input", onSearch);

  // Separate container: #minimizedList
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
  const { listMessage } = dom;
  listMessage.hidden = true;

  const row = event.target.closest(".site-row");
  if (!row) return;

  const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
  if (!website) return;

  // Route to appropriate action handler based on button class
  const openTrigger = event.target.closest(".open-site");
  if (openTrigger) {
    await handleOpenSite(website, openTrigger, dom);
    return;
  }

  if (event.target.closest(".edit-site")) {
    handleEditSite(website);
    return;
  }

  if (event.target.closest(".delete-site")) {
    await handleDeleteSite(website, dom);
    return;
  }

  const lockBtn = event.target.closest(".cred-pair__lock");
  if (lockBtn) {
    await handleLockClick(lockBtn, website);
    return;
  }

  if (event.target.closest(".minimize-site")) {
    handleMinimize(row, website);
    return;
  }

  const fillBtn = event.target.closest(".cred-pair__fill");
  if (fillBtn) {
    await handleFillClick(fillBtn, website, dom);
    return;
  }

  // Add credential row to existing site
  const addCredRow = event.target.closest(".add-cred-row");
  if (addCredRow) {
    // Check if there's already a cred-adder open on this row
    const existingAdder = row.querySelector(".cred-adder");
    if (existingAdder) {
      existingAdder.remove();
      return;
    }
    const adder = createInlineCredentialAdder(website.id);
    const credWrap = row.querySelector(".cred-wrap") || row;
    credWrap.after(adder);

    // Wire save/cancel handlers
    adder.querySelector(".cred-adder__save").addEventListener("click", async () => {
      await handleInlineAddCredential(adder, website, row);
    });
    adder.querySelector(".cred-adder__cancel").addEventListener("click", () => {
      adder.remove();
    });
    return;
  }
}

/**
 * Handle saving a credential from the inline credential adder.
 */
async function handleInlineAddCredential(adder, website, row) {
  const { listMessage, siteList, entryCount } = dom;
  const loginVal = adder.querySelector(".cred-adder__login").value.trim();
  const passwordVal = adder.querySelector(".cred-adder__password").value.trim();

  if (!loginVal || !passwordVal) {
    showToast(listMessage, "Please fill in both fields", "warning");
    return;
  }

  const loginEncrypted = await encryptSecret(loginVal);
  const passwordEncrypted = await encryptSecret(passwordVal);

  const newCred = createCredential({ loginEncrypted, passwordEncrypted });
  website.credentials.push(newCred);

  await saveWebsites(popupState.websites);
  await renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
  showToast(listMessage, t("savedSuccess"), "success");
}

async function onListDblClick(event) {
  const { listMessage } = dom;

  // Double-click on minimized chip = restore
  const minimizedChip = event.target.closest(".minimized-site");
  if (minimizedChip) {
    await handleRestoreMinimized(minimizedChip, dom);
    return;
  }

  // Double-click on site title = copy URL
  const title = event.target.closest(".open-site");
  if (title) {
    const row = event.target.closest(".site-row");
    if (!row) return;
    const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
    if (!website) return;
    await handleCopy(website.url, title, dom, "copiedUrl");
    return;
  }

  // Double-click on login text = copy login
  const loginSpan = event.target.closest(".cred-pair__login");
  if (loginSpan) {
    await handleCopy(loginSpan.textContent, loginSpan, dom, "copiedUsername");
    return;
  }
}
