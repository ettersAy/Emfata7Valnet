import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
import { saveWebsites } from "../common/storage.js";

const dom = {};
let dragSource = null;

export function initDrag(refs) {
  Object.assign(dom, refs);
  wireDragEvents();
}

function wireDragEvents() {
  const list = dom.siteList;

  list.addEventListener("dragstart", onDragStart);
  list.addEventListener("dragover", onDragOver);
  list.addEventListener("drop", onDrop);
  list.addEventListener("dragend", onDragEnd);
}

function onDragStart(e) {
  const row = e.target.closest(".site-row");
  if (!row) {
    e.preventDefault();
    return;
  }
  dragSource = row;
  row.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", row.dataset.websiteId);
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const row = e.target.closest(".site-row");
  if (!row || row === dragSource) return;

  const list = dom.siteList;
  const children = Array.from(list.children);
  const sourceIdx = children.indexOf(dragSource);
  const targetIdx = children.indexOf(row);

  if (sourceIdx < targetIdx) {
    list.insertBefore(dragSource, row.nextSibling);
  } else {
    list.insertBefore(dragSource, row);
  }
}

async function onDrop(e) {
  e.preventDefault();
  if (!dragSource) return;

  const list = dom.siteList;
  const children = Array.from(list.children);
  const newOrder = children.map((child) => child.dataset.websiteId);

  // Reorder websites array and update order timestamps
  const lookup = new Map(popupState.websites.map((w) => [w.id, w]));
  const now = Date.now();

  popupState.websites = newOrder
    .map((id, index) => {
      const website = lookup.get(id);
      if (website) {
        website.order = now - index;
      }
      return website;
    })
    .filter(Boolean);

  await saveWebsites(popupState.websites);
  renderWebsites(filteredWebsites(), list);
  updateEntryCount(
    popupState.websites.length,
    filteredWebsites().length,
    dom.entryCount
  );
}

function onDragEnd() {
  if (dragSource) {
    dragSource.classList.remove("dragging");
    dragSource = null;
  }
}
