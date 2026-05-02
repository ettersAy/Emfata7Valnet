import { t } from "../common/i18n.js";
import { getDisplayUrl, isUrl } from "../common/models.js";


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

  const urlLike = website.type !== "text" && isUrl(website.url);

  const top = document.createElement("div");
  top.className = "site-head";

  const title = document.createElement("strong");
  title.textContent = getDisplayUrl(website.url);
  title.className = "open-site";
  title.dataset.type = website.type || (urlLike ? "url" : "text");
  // Full URL in tooltip, shown on hover
  title.title = website.url;
  // Prefix icon depends on type
  if (!urlLike) {
    title.classList.add("open-site--app");
  }

  const edit = document.createElement("button");
  edit.type = "button";
  edit.className = "icon-btn edit-site";
  edit.textContent = "✏️";
  edit.title = t("editEntryTitle");

  const addCred = document.createElement("button");
  addCred.type = "button";
  addCred.className = "icon-btn add-cred-row";
  addCred.textContent = "🔑";
  addCred.title = t("addCredentialRowTitle");

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "icon-btn delete-site";
  remove.textContent = "🗑";
  remove.title = t("deleteEntryTitle");

  const minimize = document.createElement("button");
  minimize.type = "button";
  minimize.className = "icon-btn minimize-site";
  minimize.textContent = "⬇";
  minimize.title = t("minimizeEntryTitle");

  top.append(dragHandle, title, edit, addCred, remove, minimize);

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

/**
 * Create an inline editor card for adding a new credential.
 * Shows three compact inputs on one row: site, login, password.
 */
export function createInlineEditor() {
  const editor = document.getElementById("inlineEditor");
  editor.hidden = false;
  editor.style.animation = "none";
  editor.offsetHeight; // trigger reflow
  editor.style.animation = "cardIn 0.3s ease both";

  // Clear previous values
  document.getElementById("inlineSiteUrl").value = "";
  document.getElementById("inlineLogin").value = "";
  document.getElementById("inlinePassword").value = "";

  // Try to pre-fill the site URL from the current active tab
  chrome.tabs?.query({ active: true, currentWindow: true }).then(([tab]) => {
    if (tab?.url) {
      try {
        const url = new URL(tab.url);
        const hostname = url.hostname.replace(/^www\./, "");
        document.getElementById("inlineSiteUrl").value = hostname;
        // Focus the login field since site is pre-filled
        document.getElementById("inlineLogin").focus();
      } catch {
        document.getElementById("inlineSiteUrl").focus();
      }
    } else {
      document.getElementById("inlineSiteUrl").focus();
    }
  }).catch(() => {
    document.getElementById("inlineSiteUrl").focus();
  });

  return editor;
}

/**
 * Create an inline credential adder form — a small row with login + password fields
 * that appears below a site's credentials to add another credential pair.
 */
export function createInlineCredentialAdder(websiteId) {
  const container = document.createElement("div");
  container.className = "cred-adder";
  container.dataset.websiteId = websiteId;

  const loginInput = document.createElement("input");
  loginInput.type = "text";
  loginInput.className = "cred-adder__login";
  loginInput.placeholder = t("siteLoginPlaceholder");

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.className = "cred-adder__password";
  passwordInput.placeholder = t("sitePasswordPlaceholder");

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "cred-adder__save";
  saveBtn.textContent = "✓";
  saveBtn.title = t("saveBtn");

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "cred-adder__cancel";
  cancelBtn.textContent = "✕";
  cancelBtn.title = t("cancelBtn");

  container.append(loginInput, passwordInput, saveBtn, cancelBtn);

  // Focus the login field
  setTimeout(() => loginInput.focus(), 50);

  // Enter key support
  loginInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordInput.focus();
    }
  });
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveBtn.click();
    }
  });

  return container;
}
