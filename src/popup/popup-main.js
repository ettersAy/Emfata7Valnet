/**
 * Popup — Orchestrator module.
 * Wires together focused sub-modules, each with a single responsibility.
 */
import { initI18n } from "../common/i18n.js";
import { initVault, lockVault, handleUnlock, bootstrapVaultGate } from "./popup-vault.js";
import { initDialog, closeDialog, onSubmit } from "./popup-dialog.js";
import { initEvents } from "./popup-events.js";
import { initDrag } from "./popup-drag.js";
import { initCollapse, collapse as collapseList } from "./popup-collapse.js";
import { initI18n, t } from "../common/i18n.js";
import { createWebsite, createCredential, isUrl } from "../common/models.js";
import { encryptSecret } from "../common/crypto.js";
import { saveWebsites } from "../common/storage.js";
import { createInlineEditor } from "./popup-dom.js";
import { bootstrap } from "./popup-bootstrap.js";
import { showInlineEditor, hideInlineEditor, saveFromInlineEditor } from "./popup-inline-editor.js";
import { wirePasswordStrength } from "./popup-password-strength.js";

/* ── DOM refs ───────────────────────────────────────────── */
const dom = {
  siteList: document.getElementById("websiteList"),
  siteDialog: document.getElementById("siteDialog"),
  siteForm: document.getElementById("siteForm"),
  vaultGate: document.getElementById("vaultGate"),
  vaultHint: document.getElementById("vaultHint"),
  vaultMessage: document.getElementById("vaultMessage"),
  masterPasswordInput: document.getElementById("masterPassword"),
  listMessage: document.getElementById("listMessage"),
  searchBar: document.getElementById("searchBar"),
  searchInput: document.getElementById("searchInput"),
  entryCount: document.getElementById("entryCount"),
  unlockBtn: document.getElementById("unlockVaultBtn"),
  togglePassBtn: document.getElementById("togglePasswordVisibility"),
  passwordStrength: document.getElementById("passwordStrength"),
  strengthFill: document.getElementById("passwordStrength")?.querySelector(".strength-fill"),
  strengthLabel: document.getElementById("passwordStrength")?.querySelector(".strength-label"),
  lockVaultBtn: document.getElementById("lockVaultBtn"),
  expandListBtn: document.getElementById("expandListBtn"),
  // Dialog refs
  dialogTitle: document.getElementById("siteDialogTitle"),
  siteUrl: document.getElementById("siteUrl"),
  credentialPairs: document.getElementById("credentialPairs"),
  addCredentialBtn: document.getElementById("addCredentialBtn"),
  cancelBtn: document.getElementById("cancelSiteDialog"),
};

// Initialize translations before modules
await initI18n();

/* ── Init all modules ───────────────────────────────────── */
initVault(dom);
initDialog(dom);
initEvents(dom);
initDrag(dom);
initCollapse(dom);

/* ── Wire password strength meter ────────────────────────── */
wirePasswordStrength(dom.masterPasswordInput, dom.passwordStrength, dom.strengthFill, dom.strengthLabel);

/* ── Wire top-level events ──────────────────────────────── */
dom.unlockBtn.addEventListener("click", async () => {
  const ok = await handleUnlock();
  if (ok) {
    const { loadAndRender } = await import("./popup-bootstrap.js");
    await loadAndRender(dom);
  }
});

dom.lockVaultBtn.addEventListener("click", async () => {
  await lockVault();
  dom.siteList.hidden = true;
  dom.searchBar.hidden = true;
  dom.vaultGate.hidden = false;
  dom.lockVaultBtn.hidden = true;
  dom.expandListBtn.hidden = true;
  await bootstrapVaultGate();
});

document.getElementById("addSiteBtn").addEventListener("click", () => showInlineEditor(dom));
document.getElementById("openSettingsBtn").addEventListener("click", () => chrome.runtime.openOptionsPage());
dom.cancelBtn.addEventListener("click", closeDialog);
dom.siteForm.addEventListener("submit", (e) => onSubmit(e));

// ── Inline Editor events ──────────────────────────────
document.getElementById("inlineSaveBtn").addEventListener("click", async () => {
  await saveFromInlineEditor(dom);
});
document.getElementById("inlineCancelBtn").addEventListener("click", () => hideInlineEditor(dom));

document.getElementById("inlinePassword").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    await saveFromInlineEditor(dom);
  }
});
document.getElementById("inlineLogin").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    const pw = document.getElementById("inlinePassword");
    if (!pw.value) {
      pw.focus();
    } else {
      await saveFromInlineEditor(dom);
    }
  }
});
document.getElementById("inlineSiteUrl").addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    document.getElementById("inlineLogin").focus();
  }
});
document.querySelectorAll("#inlineEditor input").forEach((input) => {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      hideInlineEditor(dom);
    }
  });
});

// Password visibility toggle in vault gate
dom.togglePassBtn.addEventListener("click", () => {
  const isPass = dom.masterPasswordInput.type === "password";
  dom.masterPasswordInput.type = isPass ? "text" : "password";
  dom.togglePassBtn.textContent = isPass ? "\uD83D\uDE48" : "\uD83D\uDC41";
});

// Double-click on empty list area collapses it
dom.siteList.addEventListener("dblclick", (e) => {
  if (e.target === dom.siteList || e.target.closest(".site-list")) {
    if (!e.target.closest(".site-row")) {
      collapseList();
    }
  }
});

/* ── Bootstrap ──────────────────────────────────────────── */
await bootstrap();

async function bootstrap() {
  await bootstrapVaultGate();

  if (await trySessionAutoUnlock()) {
    await loadAndRender();
    return;
  }

  dom.siteList.hidden = true;
  dom.searchBar.hidden = true;
  dom.vaultGate.hidden = false;
  dom.lockVaultBtn.hidden = true;
  dom.expandListBtn.hidden = true;
}

async function loadAndRender() {
  popupState.websites = await getWebsites();
  // Sort by order (descending so newest/highest order first)
  popupState.websites.sort((a, b) => (b.order || 0) - (a.order || 0));
  popupState.searchQuery = "";
  dom.searchInput.value = "";
  await renderWebsites(popupState.websites, dom.siteList);
  updateEntryCount(popupState.websites.length, popupState.websites.length, dom.entryCount);
  dom.siteList.hidden = false;
  dom.searchBar.hidden = false;
  dom.vaultGate.hidden = true;
  dom.lockVaultBtn.hidden = false;
  dom.expandListBtn.hidden = true;
  popupState.collapsed = false;
}

function evaluateStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 14) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { strength: "weak", label: t("strengthWeak") };
  if (score === 2) return { strength: "fair", label: t("strengthFair") };
  if (score === 3) return { strength: "good", label: t("strengthGood") };
  return { strength: "strong", label: t("strengthStrong") };
}

/* ── Inline Editor Functions ──────────────────────────── */

function showInlineEditor() {
  // Don't show if already editing
  const existing = document.getElementById("inlineEditor");
  if (!existing.hidden) return;

  // Hide empty state if present
  const emptyState = dom.siteList.querySelector(".empty-state");
  if (emptyState) {
    emptyState.dataset.wasEmpty = "true";
    emptyState.hidden = true;
  }
  const editor = createInlineEditor();
  // Insert at the top of the site list (before all children)
  dom.siteList.prepend(editor);
}

function hideInlineEditor() {
  const editor = document.getElementById("inlineEditor");
  editor.hidden = true;
  // Move it back to the main container (where it was in the HTML)
  const main = document.querySelector(".app");
  main.appendChild(editor);
  // Restore empty state if needed
  const emptyState = dom.siteList.querySelector(".empty-state[data-was-empty]");
  if (emptyState) {
    emptyState.hidden = false;
    delete emptyState.dataset.wasEmpty;
  }
}

async function saveFromInlineEditor() {
  const siteUrl = document.getElementById("inlineSiteUrl").value.trim();
  const login = document.getElementById("inlineLogin").value.trim();
  const password = document.getElementById("inlinePassword").value.trim();

  if (!siteUrl || !login || !password) {
    showToast(dom.listMessage, "Please fill in all fields", "warning");
    return;
  }

  const loginEncrypted = await encryptSecret(login);
  const passwordEncrypted = await encryptSecret(password);

  const credential = createCredential({
    loginEncrypted,
    passwordEncrypted
  });

  const type = isUrl(siteUrl) ? "url" : "text";

  const website = createWebsite({
    url: siteUrl,
    label: siteUrl,
    credentials: [credential],
    type,
    order: Date.now()
  });

  popupState.websites.push(website);
  await saveWebsites(popupState.websites);

  hideInlineEditor();
  await renderWebsites(filteredWebsites(), dom.siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, dom.entryCount);
  showToast(dom.listMessage, t("savedSuccess") || "Saved!", "success");
}
await bootstrap(dom);
