import { popupState } from "./popup-state.js";

const dom = {};

export function initCollapse(refs) {
  Object.assign(dom, refs);
  wireCollapse();
}

function wireCollapse() {
  dom.expandListBtn.addEventListener("click", expand);
}

/** Collapse the website list to a floating button. */
export function collapse() {
  popupState.collapsed = true;
  dom.siteList.hidden = true;
  dom.searchBar.hidden = true;
  dom.expandListBtn.hidden = false;
  dom.expandListBtn.textContent = `📋 المفاتيح (${popupState.websites.length})`;
}

/** Expand the website list. */
export function expand() {
  popupState.collapsed = false;
  dom.siteList.hidden = false;
  dom.searchBar.hidden = false;
  dom.expandListBtn.hidden = true;
}

/** Toggle collapsed state. */
export function toggleCollapse() {
  if (popupState.collapsed) {
    expand();
  } else {
    collapse();
  }
}
