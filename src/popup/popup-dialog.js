import { createWebsite, createCredential } from "../common/models.js";
import { encryptSecret } from "../common/crypto.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
import { t } from "../common/i18n.js";
import { saveWebsites } from "../common/storage.js";

const dom = {};

export function initDialog(refs) {
  Object.assign(dom, refs);
  wireDialogEvents();
}

function wireDialogEvents() {
  dom.addCredentialBtn?.addEventListener("click", () => addCredentialPair());
  // Delegate remove and toggle-pass events
  dom.credentialPairs?.addEventListener("click", (e) => {
    const removeBtn = e.target.closest(".remove-cred-btn");
    if (removeBtn) {
      const pair = removeBtn.closest(".credential-pair-fields");
      if (pair) pair.remove();
      return;
    }
    const toggleBtn = e.target.closest(".toggle-pass-btn");
    if (toggleBtn) {
      const input = toggleBtn.closest(".password-input-wrap").querySelector("input");
      if (input) {
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        toggleBtn.textContent = isPass ? "🙈" : "👁";
      }
    }
  });
}

/**
 * Add a credential pair row (login + password) to the dialog.
 */
function addCredentialPair(loginValue = "", passwordValue = "") {
  const template = document.getElementById("credentialPairTemplate");
  const clone = template.content.cloneNode(true);
  const pairDiv = clone.querySelector(".credential-pair-fields");

  // Set values if provided
  const loginInput = pairDiv.querySelector(".cred-login-input");
  const passwordInput = pairDiv.querySelector(".cred-password-input");
  if (loginValue) loginInput.value = loginValue;
  if (passwordValue) passwordInput.value = passwordValue;

  dom.credentialPairs.appendChild(pairDiv);
}

/**
 * Get all credential pairs data from the dialog.
 */
function getCredentialPairsFromDialog() {
  const pairs = [];
  const pairElements = dom.credentialPairs.querySelectorAll(".credential-pair-fields");
  for (const el of pairElements) {
    const login = el.querySelector(".cred-login-input")?.value?.trim();
    const password = el.querySelector(".cred-password-input")?.value?.trim();
    if (login && password) {
      pairs.push({ login, password });
    }
  }
  return pairs;
}

export function openDialog(website = null) {
  popupState.editWebsiteId = website?.id ?? null;
  dom.siteForm.reset();
  dom.credentialPairs.innerHTML = "";

  if (website) {
    dom.dialogTitle.textContent = t("editSiteTitle");
    dom.siteUrl.value = website.url;

    // Populate credential pairs from existing credentials
    const creds = website.credentials || [];
    if (creds.length > 0) {
      // For edit mode, we show the existing credentials with placeholder dots
      // The real values are stored in dataset for preservation
      const credentialData = [];
      creds.forEach((cred) => {
        credentialData.push({
          id: cred.id,
          loginEncrypted: cred.loginEncrypted,
          passwordEncrypted: cred.passwordEncrypted
        });
        addCredentialPair("••••••", "••••••");
      });
      dom.credentialPairs.dataset.credentials = JSON.stringify(credentialData);
    } else {
      // No existing credentials, add one empty pair
      addCredentialPair();
      dom.credentialPairs.dataset.credentials = "[]";
    }
  } else {
    dom.dialogTitle.textContent = t("addSiteTitle");
    // Start with one empty credential pair
    addCredentialPair();
    dom.credentialPairs.dataset.credentials = "[]";
  }

  dom.siteDialog.showModal();
}

export function closeDialog() {
  dom.siteDialog.close();
}

export async function onSubmit(event) {
  event.preventDefault();
  const { siteUrl, entryCount, siteList } = dom;

  const url = siteUrl.value.trim();
  const pairs = getCredentialPairsFromDialog();

  if (pairs.length === 0) return;

  // Preserve existing encrypted credentials if user didn't change values
  let existingCreds = [];
  try {
    existingCreds = JSON.parse(dom.credentialPairs.dataset.credentials || "[]");
  } catch { /* ignore */ }

  const credentials = [];
  const pairElements = dom.credentialPairs.querySelectorAll(".credential-pair-fields");
  let existingIdx = 0;

  for (let i = 0; i < pairElements.length; i++) {
    const el = pairElements[i];
    const loginVal = el.querySelector(".cred-login-input")?.value?.trim() || "";
    const passwordVal = el.querySelector(".cred-password-input")?.value?.trim() || "";

    let loginEncrypted, passwordEncrypted;

    if (loginVal === "••••••" && existingIdx < existingCreds.length) {
      // Preserve existing encrypted login
      loginEncrypted = existingCreds[existingIdx].loginEncrypted;
    } else if (loginVal && loginVal !== "••••••") {
      loginEncrypted = await encryptSecret(loginVal);
    } else {
      continue; // skip empty
    }

    if (passwordVal === "••••••" && existingIdx < existingCreds.length) {
      // Preserve existing encrypted password
      passwordEncrypted = existingCreds[existingIdx].passwordEncrypted;
    } else if (passwordVal && passwordVal !== "••••••") {
      passwordEncrypted = await encryptSecret(passwordVal);
    } else {
      continue; // skip empty
    }

    existingIdx++;
    credentials.push(createCredential({
      id: existingIdx <= existingCreds.length && existingCreds[existingIdx - 1]
        ? existingCreds[existingIdx - 1].id
        : undefined,
      loginEncrypted,
      passwordEncrypted
    }));
  }

  const existingWebsiteIdx = popupState.editWebsiteId
    ? popupState.websites.findIndex((w) => w.id === popupState.editWebsiteId)
    : -1;

  const website = createWebsite({
    id: popupState.editWebsiteId ?? undefined,
    url,
    label: url,
    credentials,
    order: existingWebsiteIdx >= 0
      ? popupState.websites[existingWebsiteIdx].order
      : Date.now()
  });

  if (existingWebsiteIdx >= 0) {
    popupState.websites[existingWebsiteIdx] = website;
  } else {
    popupState.websites.push(website);
  }

  await saveWebsites(popupState.websites);
  dom.siteDialog.close();
  await renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
}
