import { createWebsite } from "../common/models.js";
import { encryptSecret } from "../common/crypto.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
import { t } from "../common/i18n.js";


import { saveWebsites } from "../common/storage.js";

const dom = {};

export function initDialog(refs) {
  Object.assign(dom, refs);
}

export function openDialog(website = null) {
  popupState.editWebsiteId = website?.id ?? null;
  dom.siteForm.reset();

  if (website) {
    dom.dialogTitle.textContent = t("editSiteTitle");
    dom.siteUrl.value = website.url;
    dom.siteLogin.value = website.usernameEncrypted
      ? "••••••"
      : "";
    dom.sitePassword.value = website.passwordEncrypted
      ? "••••••"
      : "";
    // track whether user changed login/password (store as JSON since encrypted values are objects)
    dom.siteForm.dataset.originalLogin = website.usernameEncrypted
      ? JSON.stringify(website.usernameEncrypted)
      : "";
    dom.siteForm.dataset.originalPassword = website.passwordEncrypted
      ? JSON.stringify(website.passwordEncrypted)
      : "";
  } else {
    dom.dialogTitle.textContent = t("addSiteTitle");
    dom.siteForm.dataset.originalLogin = "";
    dom.siteForm.dataset.originalPassword = "";
  }

  dom.siteDialog.showModal();
}

export function closeDialog() {
  dom.siteDialog.close();
}

export async function onSubmit(event) {
  event.preventDefault();
  const { siteUrl, siteLogin, sitePassword, siteForm, entryCount, siteList } = dom;

  const url = siteUrl.value;
  const loginPlain = siteLogin.value;
  const passwordPlain = sitePassword.value;

  // Preserve encrypted values if user didn't change the placeholder
  const origLogin = siteForm.dataset.originalLogin || "";
  const origPass = siteForm.dataset.originalPassword || "";

  const usernameEncrypted =
    loginPlain && loginPlain !== "••••••"
      ? await encryptSecret(loginPlain)
      : origLogin
        ? JSON.parse(origLogin)
        : null;

  const passwordEncrypted =
    passwordPlain && passwordPlain !== "••••••"
      ? await encryptSecret(passwordPlain)
      : origPass
        ? JSON.parse(origPass)
        : null;

  const existingIdx = popupState.editWebsiteId
    ? popupState.websites.findIndex((w) => w.id === popupState.editWebsiteId)
    : -1;

  const website = createWebsite({
    id: popupState.editWebsiteId ?? undefined,
    url,
    label: url,
    usernameEncrypted,
    passwordEncrypted,
    order: existingIdx >= 0
      ? popupState.websites[existingIdx].order
      : Date.now()
  });

  if (existingIdx >= 0) {
    popupState.websites[existingIdx] = website;
  } else {
    popupState.websites.push(website);
  }

  await saveWebsites(popupState.websites);
  dom.siteDialog.close();
  renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
}
