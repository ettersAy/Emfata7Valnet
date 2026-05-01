import { createWebsite, normalizeUrlForOpen } from "../common/models.js";
import { getFieldKeywords, getWebsites, saveWebsites } from "../common/storage.js";
import {
  decryptSecret,
  encryptSecret,
  isMasterPasswordConfigured,
  isUnlocked,
  setupMasterPassword,
  unlockMasterPassword
} from "../common/crypto.js";
import { popupState } from "./popup-state.js";
import { renderWebsites } from "./popup-render.js";

const SESSION_KEYS = {
  MASTER_PASSWORD: "session_master_password",
  UNLOCK_DATE: "session_unlock_date"
};

const siteList = document.getElementById("websiteList");
const siteDialog = document.getElementById("siteDialog");
const siteForm = document.getElementById("siteForm");
const credentialsContainer = document.getElementById("credentialsContainer");
const credentialTemplate = document.getElementById("credentialRowTemplate");
const vaultGate = document.getElementById("vaultGate");
const vaultHint = document.getElementById("vaultHint");
const vaultMessage = document.getElementById("vaultMessage");
const masterPasswordInput = document.getElementById("masterPassword");
const listMessage = document.getElementById("listMessage");

const unlockBtn = document.getElementById("unlockVaultBtn");
unlockBtn.addEventListener("click", onUnlock);
document.getElementById("addSiteBtn").addEventListener("click", () => openDialog());
document.getElementById("openSettingsBtn").addEventListener("click", () => chrome.runtime.openOptionsPage());
document.getElementById("cancelSiteDialog").addEventListener("click", () => siteDialog.close());
document.getElementById("addCredentialBtn").addEventListener("click", () => addCredentialRow());
siteList.addEventListener("click", onListClick);
siteForm.addEventListener("submit", onSiteSubmit);

await bootstrap();

async function bootstrap() {
  const configured = await isMasterPasswordConfigured();
  vaultHint.textContent = configured
    ? "Enter your master key once per day."
    : "Create your master key to encrypt the vault.";

  if (await trySessionAutoUnlock()) {
    await loadAndRender();
    return;
  }

  siteList.hidden = true;
  vaultGate.hidden = false;
}

async function trySessionAutoUnlock() {
  if (isUnlocked()) return true;

  const today = new Date().toISOString().slice(0, 10);
  const data = await chrome.storage.session.get([SESSION_KEYS.MASTER_PASSWORD, SESSION_KEYS.UNLOCK_DATE]);
  if (data[SESSION_KEYS.UNLOCK_DATE] !== today || !data[SESSION_KEYS.MASTER_PASSWORD]) {
    return false;
  }

  return unlockMasterPassword(data[SESSION_KEYS.MASTER_PASSWORD]);
}

async function onUnlock() {
  const password = masterPasswordInput.value;
  if (!password || password.length < 4) {
    vaultMessage.textContent = "Use at least 4 characters.";
    return;
  }

  const configured = await isMasterPasswordConfigured();
  const success = configured ? await unlockMasterPassword(password) : await (setupMasterPassword(password).then(() => true));

  if (!success) {
    vaultMessage.textContent = "Invalid master key.";
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  await chrome.storage.session.set({ [SESSION_KEYS.MASTER_PASSWORD]: password, [SESSION_KEYS.UNLOCK_DATE]: today });

  masterPasswordInput.value = "";
  vaultMessage.textContent = "Vault unlocked.";
  await loadAndRender();
}

async function loadAndRender() {
  popupState.websites = await getWebsites();
  renderWebsites(popupState.websites, siteList);
  siteList.hidden = false;
  vaultGate.hidden = true;
}

function openDialog(website = null) {
  popupState.editWebsiteId = website?.id ?? null;
  siteForm.reset();
  credentialsContainer.innerHTML = "";

  if (website) {
    document.getElementById("siteDialogTitle").textContent = "Edit website";
    siteForm.url.value = website.url;
    siteForm.label.value = website.label;
    website.credentials.forEach((cred) => addCredentialRow({ ...cred, username: "", password: "" }));
  } else {
    document.getElementById("siteDialogTitle").textContent = "Add website";
    addCredentialRow();
  }

  siteDialog.showModal();
}

function addCredentialRow(credential = null) {
  const node = credentialTemplate.content.firstElementChild.cloneNode(true);
  const nameInput = node.querySelector(".credential-name");
  const userInput = node.querySelector(".credential-username");
  const passInput = node.querySelector(".credential-password");
  const removeBtn = node.querySelector(".remove-credential");

  if (credential) {
    node.dataset.credentialId = credential.id;
    nameInput.value = credential.label;
    userInput.value = credential.username;
    passInput.value = credential.password;
  }

  removeBtn.addEventListener("click", () => node.remove());
  credentialsContainer.appendChild(node);
}

async function onSiteSubmit(event) {
  event.preventDefault();
  const credentials = await Promise.all(
    Array.from(credentialsContainer.querySelectorAll(".credential-row")).map(async (row) => ({
      id: row.dataset.credentialId ?? crypto.randomUUID(),
      label: row.querySelector(".credential-name").value.trim(),
      usernameEncrypted: await encryptSecret(row.querySelector(".credential-username").value.trim()),
      passwordEncrypted: await encryptSecret(row.querySelector(".credential-password").value)
    }))
  );

  const website = createWebsite({
    id: popupState.editWebsiteId ?? undefined,
    url: siteForm.url.value,
    label: siteForm.label.value,
    credentials
  });

  const idx = popupState.websites.findIndex((item) => item.id === website.id);
  if (idx >= 0) popupState.websites[idx] = website;
  else popupState.websites.push(website);

  await saveWebsites(popupState.websites);
  siteDialog.close();
  renderWebsites(popupState.websites, siteList);
}

async function onListClick(event) {
  listMessage.textContent = "";
  const row = event.target.closest(".site-row");
  if (!row) return;

  const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
  if (!website) return;

  if (event.target.closest(".open-site")) {
    const normalized = normalizeUrlForOpen(website.url);
    if (!normalized) {
      listMessage.textContent = "This entry is not a valid web address.";
      return;
    }
    await chrome.tabs.create({ url: normalized });
    return;
  }

  if (event.target.closest(".edit-site")) {
    openDialog(website);
    return;
  }

  if (event.target.closest(".delete-site")) {
    popupState.websites = popupState.websites.filter((item) => item.id !== website.id);
    await saveWebsites(popupState.websites);
    renderWebsites(popupState.websites, siteList);
    return;
  }

  const credentialChip = event.target.closest(".credential-chip");
  if (credentialChip) {
    const credential = website.credentials.find((item) => item.id === credentialChip.dataset.credentialId);
    if (!credential) return;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !tab.url) return;

    const normalized = normalizeUrlForOpen(website.url);
    if (!normalized || new URL(tab.url).hostname !== new URL(normalized).hostname) {
      listMessage.textContent = "Autofill blocked: host mismatch.";
      return;
    }

    await chrome.tabs.sendMessage(tab.id, {
      type: "RUN_AUTOFILL",
      payload: {
        credential: {
          username: await decryptSecret(credential.usernameEncrypted),
          password: await decryptSecret(credential.passwordEncrypted)
        },
        fieldKeywords: await getFieldKeywords()
      }
    });
  }
}
