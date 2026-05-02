/**
 * Popup bootstrap module for مفاتيح.
 * Single responsibility: orchestrate the initial bootstrap sequence
 * (check auto-unlock, render data or show vault gate).
 */
import { getWebsites } from "../common/storage.js";
import { popupState } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
import { bootstrapVaultGate, trySessionAutoUnlock } from "./popup-vault.js";

/**
 * Bootstrap the popup: check auto-unlock, then either show vault gate
 * or load and render the website list.
 * @param {Object} dom - DOM refs
 */
export async function bootstrap(dom) {
  await bootstrapVaultGate();

  if (await trySessionAutoUnlock()) {
    await loadAndRender(dom);
    return;
  }

  dom.siteList.hidden = true;
  dom.searchBar.hidden = true;
  dom.vaultGate.hidden = false;
  dom.lockVaultBtn.hidden = true;
  dom.expandListBtn.hidden = true;
}

/**
 * Load websites from storage and render them.
 * @param {Object} dom - DOM refs
 */
export async function loadAndRender(dom) {
  popupState.websites = await getWebsites();
  popupState.websites.sort((a, b) => (b.order || 0) - (a.order || 0));
  popupState.searchQuery = "";
  dom.searchInput.value = "";

  await renderWebsites(popupState.websites, dom.siteList);
  updateEntryCount(popupState.websites.length, popupState.websites.length, dom.entryCount);

  dom.siteList.hidden = false;
  dom.searchBar.hidden = false;
  dom.vaultGate.hidden = true;
  dom.lockVaultBtn.hidden = false;
  dom.expandListBtn.hidden = true;
  popupState.collapsed = false;
}
