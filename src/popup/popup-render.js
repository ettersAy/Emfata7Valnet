import { createCredentialChip, clearElement, createEmptyState } from "./popup-dom.js";

/**
 * Renders the website list with staggered card-in animations.
 * @param {Array} websites
 * @param {HTMLElement} root
 */
export function renderWebsites(websites, root) {
  clearElement(root);

  if (!websites.length) {
    root.appendChild(
      createEmptyState(
        "Click the + button above to add your first website credential.",
        "🗄️"
      )
    );
    return;
  }

  websites.forEach((website, index) => {
    const row = document.createElement("article");
    row.className = "site-row";
    row.dataset.websiteId = website.id;
    row.style.animationDelay = `${index * 0.05}s`;

    const top = document.createElement("div");
    top.className = "site-head";

    const title = document.createElement("strong");
    title.textContent = website.label;
    title.className = "open-site";
    title.title = `Open ${website.url}`;

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "icon-btn edit-site";
    edit.textContent = "✏️";
    edit.title = "Edit entry";

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "icon-btn delete-site";
    remove.textContent = "🗑";
    remove.title = "Delete entry";

    top.append(title, edit, remove);

    const credWrap = document.createElement("div");
    credWrap.className = "cred-wrap";
    website.credentials.forEach((credential) =>
      credWrap.appendChild(createCredentialChip(website.id, credential))
    );

    row.append(top, credWrap);
    root.appendChild(row);
  });
}

/**
 * Updates the entry count badge.
 * @param {number} total
 * @param {number} visible
 * @param {HTMLElement} countEl
 */
export function updateEntryCount(total, visible, countEl) {
  if (total === visible) {
    countEl.textContent = `${total} entries`;
  } else {
    countEl.textContent = `${visible} / ${total}`;
  }
}
