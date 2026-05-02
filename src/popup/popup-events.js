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
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
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
  if (event.target.closest(".open-site")) {
    await handleOpenSite(website, dom);
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
