import { t } from "../common/i18n.js";


export function createSiteRow(website, index) {
  const row = document.createElement("article");
  row.className = "site-row";
  row.dataset.websiteId = website.id;
  row.dataset.index = index;
  row.draggable = true;
  row.style.animationDelay = `${index * 0.05}s`;

  // Drag handle
  const dragHandle = document.createElement("span");
  dragHandle.className = "drag-handle";
  dragHandle.textContent = "⠿";
  dragHandle.title = t("dragHandleTitle");

  const top = document.createElement("div");
  top.className = "site-head";

  const title = document.createElement("strong");
  title.textContent = website.label;
  title.className = "open-site";
  title.title = t("openSiteTitle", { url: website.url });

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "icon-btn edit-site";
  edit.textContent = "✏️";
  edit.title = t("editEntryTitle");

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-btn delete-site";
  remove.textContent = "🗑";
  remove.title = t("deleteEntryTitle");

  top.append(dragHandle, title, edit, remove);

  const credWrap = document.createElement("div");
  credWrap.className = "cred-wrap";

  if (website.usernameEncrypted || website.passwordEncrypted) {
    const loginChip = createCredentialChip(website.id, "login", "👤");
    const passChip = createCredentialChip(website.id, "password", "🔐");
    credWrap.append(loginChip, passChip);
  }

  row.append(top, credWrap);
  return row;
}

export function createCredentialChip(websiteId, type, icon) {
  const chip = document.createElement("button");
  chip.className = "credential-chip";
  chip.type = "button";
  chip.dataset.websiteId = websiteId;
  chip.dataset.copyType = type;

  const label = document.createElement("span");
  label.className = "chip-label";
  label.textContent = type === "login" ? t("chipLabelUsername") : t("chipLabelPassword");

  const iconEl = document.createElement("span");
  iconEl.className = "chip-icon";
  iconEl.textContent = icon;

  chip.append(label, iconEl);
  return chip;
}

export function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

export function createEmptyState(message, icon = "📭") {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";

  const iconEl = document.createElement("span");
  iconEl.className = "empty-state__icon";
  iconEl.textContent = icon;

  const heading = document.createElement("h3");
  heading.textContent = t("noEntriesYet");

  const text = document.createElement("p");
  text.textContent = message;

  wrapper.append(iconEl, heading, text);
  return wrapper;
}
