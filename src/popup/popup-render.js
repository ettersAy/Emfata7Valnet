import { createCredentialChip, clearElement } from "./popup-dom.js";

export function renderWebsites(websites, root) {
  clearElement(root);

  if (!websites.length) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No websites yet. Click 🌐 to add one.";
    root.appendChild(empty);
    return;
  }

  websites.forEach((website) => {
    const row = document.createElement("article");
    row.className = "site-row";
    row.dataset.websiteId = website.id;

    const top = document.createElement("div");
    top.className = "site-head";

    const title = document.createElement("strong");
    title.textContent = `🚀 ${website.label}`;
    title.className = "open-site";

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "icon-btn edit-site";
    edit.textContent = "📝";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn delete-site";
    remove.textContent = "🗑️";

    top.append(title, edit, remove);

    const credWrap = document.createElement("div");
    credWrap.className = "cred-wrap";
    website.credentials.forEach((credential) => credWrap.appendChild(createCredentialChip(website.id, credential)));

    row.append(top, credWrap);
    root.appendChild(row);
  });
}
