import { t } from "../common/i18n.js";
import { getDisplayUrl } from "../common/models.js";


export function createSiteRow(website, index, decryptedCredentials = []) {
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
  title.textContent = getDisplayUrl(website.url);
  title.className = "open-site";
  // Full URL in tooltip, shown on hover
  title.title = website.url;

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

  if (decryptedCredentials.length > 0) {
    decryptedCredentials.forEach((cred) => {
      credWrap.appendChild(createCredentialPair(website.id, cred));
    });
  }

  row.append(top, credWrap);
  return row;
}

/**
 * Create a credential pair row: [login/email] 🔒 [fill]
 */
export function createCredentialPair(websiteId, cred) {
  const pair = document.createElement("div");
  pair.className = "cred-pair";
  pair.dataset.websiteId = websiteId;
  pair.dataset.credId = cred.id;

  // Login/email display (not hidden)
  const loginSpan = document.createElement("span");
  loginSpan.className = "cred-pair__login";
  loginSpan.textContent = cred.login || "";
  loginSpan.title = cred.login || "";

  // Lock emoji — toggle password visibility
  const lockBtn = document.createElement("button");
  lockBtn.type = "button";
  lockBtn.className = "cred-pair__lock";
  lockBtn.textContent = "🔒";
  lockBtn.title = t("showPasswordTitle");
  lockBtn.dataset.credId = cred.id;
  lockBtn.dataset.websiteId = websiteId;

  // Fill emoji — autofill inputs
  const fillBtn = document.createElement("button");
  fillBtn.type = "button";
  fillBtn.className = "cred-pair__fill";
  fillBtn.textContent = "📋";
  fillBtn.title = t("fillCredentialsTitle");
  fillBtn.dataset.credId = cred.id;
  fillBtn.dataset.websiteId = websiteId;

  pair.append(loginSpan, lockBtn, fillBtn);
  return pair;
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
