import { getWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount } from "./popup-render.js";
import { initVault, trySessionAutoUnlock, bootstrapVaultGate, handleUnlock, lockVault } from "./popup-vault.js";
import { initDialog, openDialog, closeDialog, onSubmit } from "./popup-dialog.js";
import { initEvents } from "./popup-events.js";
import { initDrag } from "./popup-drag.js";
import { initCollapse, collapse as collapseList } from "./popup-collapse.js";

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
  siteLogin: document.getElementById("siteLogin"),
  sitePassword: document.getElementById("sitePassword"),
  dialogTogglePass: document.getElementById("dialogTogglePass"),
  cancelBtn: document.getElementById("cancelSiteDialog"),
};

/* ── Init all modules ───────────────────────────────────── */
initVault(dom);
initDialog(dom);
initEvents(dom);
initDrag(dom);
initCollapse(dom);

/* ── Wire top-level events ──────────────────────────────── */
dom.unlockBtn.addEventListener("click", async () => {
  const ok = await handleUnlock();
  if (ok) await loadAndRender();
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

document.getElementById("addSiteBtn").addEventListener("click", () => openDialog());
document.getElementById("openSettingsBtn").addEventListener("click", () => chrome.runtime.openOptionsPage());
dom.cancelBtn.addEventListener("click", closeDialog);
dom.siteForm.addEventListener("submit", (e) => onSubmit(e));

// Password visibility toggle in vault gate
dom.togglePassBtn.addEventListener("click", () => {
  const isPass = dom.masterPasswordInput.type === "password";
  dom.masterPasswordInput.type = isPass ? "text" : "password";
  dom.togglePassBtn.textContent = isPass ? "🙈" : "👁";
});

// Password visibility toggle in dialog
dom.dialogTogglePass.addEventListener("click", () => {
  const isPass = dom.sitePassword.type === "password";
  dom.sitePassword.type = isPass ? "text" : "password";
  dom.dialogTogglePass.textContent = isPass ? "🙈" : "👁";
});

// Password strength meter
dom.masterPasswordInput.addEventListener("input", () => {
  const val = dom.masterPasswordInput.value;
  if (!val) {
    dom.passwordStrength.hidden = true;
    return;
  }
  dom.passwordStrength.hidden = false;
  const { strength, label } = evaluateStrength(val);
  dom.strengthFill.className = `strength-fill ${strength}`;
  dom.strengthLabel.textContent = label;
});

// Collapse button in list (double-click on empty area or custom gesture)
// We add a small collapse button inside the list area
dom.siteList.addEventListener("dblclick", (e) => {
  // Double-click on empty space in the list collapses it
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
  renderWebsites(popupState.websites, dom.siteList);
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

  if (score <= 1) return { strength: "weak", label: "ضعيف — أضف تنوعاً أكثر" };
  if (score === 2) return { strength: "fair", label: "مقبول" };
  if (score === 3) return { strength: "good", label: "جيد — يكاد يكون قوياً" };
  return { strength: "strong", label: "قوي — ممتاز!" };
}
