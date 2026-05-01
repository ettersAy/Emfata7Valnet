import { normalizeUrlForOpen } from "../common/models.js";
import { decryptSecret } from "../common/crypto.js";
import { getFieldKeywords, saveWebsites } from "../common/storage.js";
import { popupState, filteredWebsites } from "./popup-state.js";
import { renderWebsites, updateEntryCount, showToast } from "./popup-render.js";
import { openDialog } from "./popup-dialog.js";

const dom = {};

export function initEvents(refs) {
  Object.assign(dom, refs);
  wireEvents();
}

function wireEvents() {
  const { siteList, searchInput, entryCount } = dom;

  siteList.addEventListener("click", onListClick);
  siteList.addEventListener("dblclick", onListDblClick);
  searchInput.addEventListener("input", onSearch);
}

function onSearch() {
  const { searchInput, siteList, entryCount } = dom;
  popupState.searchQuery = searchInput.value.trim().toLowerCase();
  renderWebsites(filteredWebsites(), siteList);
  updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
}

async function onListClick(event) {
  const { listMessage, siteList, entryCount } = dom;
  listMessage.hidden = true;
  const row = event.target.closest(".site-row");
  if (!row) return;

  const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
  if (!website) return;

  // Open site
  if (event.target.closest(".open-site")) {
    const normalized = normalizeUrlForOpen(website.url);
    if (!normalized) {
      showToast(listMessage, "هذا الإدخال ليس عنوان ويب صالح.", "warning");
      return;
    }
    await chrome.tabs.create({ url: normalized });
    return;
  }

  // Edit
  if (event.target.closest(".edit-site")) {
    openDialog(website);
    return;
  }

  // Delete
  if (event.target.closest(".delete-site")) {
    popupState.websites = popupState.websites.filter((item) => item.id !== website.id);
    await saveWebsites(popupState.websites);
    renderWebsites(filteredWebsites(), siteList);
    updateEntryCount(popupState.websites.length, filteredWebsites().length, entryCount);
    showToast(listMessage, "تم الحذف.", "success");
    return;
  }

  // Credential chip — autofill
  const chip = event.target.closest(".credential-chip");
  if (chip) {
    await handleCredentialChipClick(chip, website, event);
  }
}

async function handleCredentialChipClick(chip, website, clickEvent) {
  const { listMessage } = dom;
  const copyType = chip.dataset.copyType;

  if (!website.usernameEncrypted || !website.passwordEncrypted) {
    showToast(listMessage, "بيانات مشفرة مفقودة.", "warning");
    return;
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Alt+click = copy password
  if (clickEvent.altKey && copyType === "password") {
    const plain = await decryptSecret(website.passwordEncrypted);
    await navigator.clipboard.writeText(plain);
    showCopyIndicator(chip);
    showToast(listMessage, "تم نسخ كلمة المرور.", "success");
    return;
  }

  // Alt+click = copy username
  if (clickEvent.altKey && copyType === "login") {
    const plain = await decryptSecret(website.usernameEncrypted);
    await navigator.clipboard.writeText(plain);
    showCopyIndicator(chip);
    showToast(listMessage, "تم نسخ اسم المستخدم.", "success");
    return;
  }

  // Normal click = autofill
  if (!tab?.id || !tab.url) return;

  const normalized = normalizeUrlForOpen(website.url);
  if (!normalized || new URL(tab.url).hostname !== new URL(normalized).hostname) {
    showToast(listMessage, "تعذر الملء التلقائي: اسم المضيف غير متطابق.", "warning");
    return;
  }

  await chrome.tabs.sendMessage(tab.id, {
    type: "RUN_AUTOFILL",
    payload: {
      credential: {
        username: await decryptSecret(website.usernameEncrypted),
        password: await decryptSecret(website.passwordEncrypted)
      },
      fieldKeywords: await getFieldKeywords()
    }
  });
  showToast(listMessage, "تم ملء البيانات تلقائياً.", "success");
}

async function onListDblClick(event) {
  const { listMessage } = dom;

  // Double-click on site title = copy URL
  const title = event.target.closest(".open-site");
  if (title) {
    const row = event.target.closest(".site-row");
    if (!row) return;
    const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
    if (!website) return;
    await navigator.clipboard.writeText(website.url);
    showCopyIndicator(title);
    showToast(listMessage, "تم نسخ الرابط.", "success");
    return;
  }

  // Double-click on credential chip = copy
  const chip = event.target.closest(".credential-chip");
  if (chip) {
    const row = event.target.closest(".site-row");
    if (!row) return;
    const website = popupState.websites.find((item) => item.id === row.dataset.websiteId);
    if (!website) return;

    const copyType = chip.dataset.copyType;
    let plain = "";

    if (copyType === "login" && website.usernameEncrypted) {
      plain = await decryptSecret(website.usernameEncrypted);
    } else if (copyType === "password" && website.passwordEncrypted) {
      plain = await decryptSecret(website.passwordEncrypted);
    }

    if (plain) {
      await navigator.clipboard.writeText(plain);
      showCopyIndicator(chip);
      showToast(listMessage, `تم نسخ ${copyType === "login" ? "اسم المستخدم" : "كلمة المرور"}.`, "success");
    }
  }
}

function showCopyIndicator(el) {
  let indicator = el.querySelector(".copy-indicator");
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = "copy-indicator";
    indicator.textContent = "تم النسخ!";
    el.appendChild(indicator);
  }
  indicator.classList.add("show");
  setTimeout(() => indicator.classList.remove("show"), 1500);
}
