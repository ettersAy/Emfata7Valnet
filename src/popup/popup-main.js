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
import { bootstrap, loadAndRender } from "./popup-bootstrap.js";
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
await bootstrap(dom);
