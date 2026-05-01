import { DEFAULT_FIELD_KEYWORDS } from "../common/constants.js";
import { getFieldKeywords, saveFieldKeywords, getWebsites, saveWebsites } from "../common/storage.js";
import { initI18n, t, getLanguages, getCurrentLanguage, saveAndApplyLanguage } from "../common/i18n.js";

/* ── DOM refs ───────────────────────────────────────────── */
const userKeywords = document.getElementById("userKeywords");
const passwordKeywords = document.getElementById("passwordKeywords");
const saveMessage = document.getElementById("saveMessage");
const userPreview = document.getElementById("userKeywordPreview");
const passwordPreview = document.getElementById("passwordKeywordPreview");

const exportJson = document.getElementById("exportJson");
const exportCsv = document.getElementById("exportCsv");
const exportMessage = document.getElementById("exportMessage");
const importFile = document.getElementById("importFile");
const importBtn = document.getElementById("importBtn");
const importMessage = document.getElementById("importMessage");
const languageSelect = document.getElementById("languageSelect");

/* ── Wire events ────────────────────────────────────────── */
document.getElementById("saveSettings").addEventListener("click", onSave);
userKeywords.addEventListener("input", () => renderChips(userKeywords.value, userPreview));
passwordKeywords.addEventListener("input", () => renderChips(passwordKeywords.value, passwordPreview));

exportJson.addEventListener("click", () => exportData("json"));
exportCsv.addEventListener("click", () => exportData("csv"));
importBtn.addEventListener("click", onImport);
languageSelect.addEventListener("change", onLanguageChange);

// Initialize i18n and then load
const currentLang = await initI18n();
populateLanguageSelector(currentLang);
await load();

/* ── Language Selector ──────────────────────────────────── */
function populateLanguageSelector(selected) {
  const languages = getLanguages();
  languageSelect.innerHTML = "";
  for (const [code, info] of Object.entries(languages)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = info.name;
    if (code === selected) {
      option.selected = true;
    }
    languageSelect.appendChild(option);
  }
}

async function onLanguageChange() {
  const newLang = languageSelect.value;
  await saveAndApplyLanguage(newLang);
  populateLanguageSelector(newLang);
  if (saveMessage.textContent) {
    saveMessage.textContent = t("saveSuccess");
  }
}

/* ── Load settings ──────────────────────────────────────── */
async function load() {
  const settings = await getFieldKeywords();
  userKeywords.value = settings.user.join(", ");
  passwordKeywords.value = settings.password.join(", ");
  renderChips(userKeywords.value, userPreview);
  renderChips(passwordKeywords.value, passwordPreview);
}

/* ── Save settings ──────────────────────────────────────── */
async function onSave() {
  const next = {
    user: parseKeywords(userKeywords.value, DEFAULT_FIELD_KEYWORDS.user),
    password: parseKeywords(passwordKeywords.value, DEFAULT_FIELD_KEYWORDS.password)
  };
  await saveFieldKeywords(next);
  saveMessage.textContent = t("saveSuccess");
  saveMessage.className = "success";
  setTimeout(() => {
    saveMessage.textContent = "";
    saveMessage.className = "";
  }, 2500);
}

/* ── Export ─────────────────────────────────────────────── */
async function exportData(format) {
  try {
    const websites = await getWebsites();
    if (!websites.length) {
      exportMessage.textContent = t("exportNoData");
      exportMessage.className = "msg error";
      return;
    }

    const exportPayload = {
      version: "0.2.0",
      exportedAt: new Date().toISOString(),
      websites
    };

    let blob, filename;
    if (format === "json") {
      blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      filename = `mafati7-export-${new Date().toISOString().slice(0, 10)}.json`;
    } else {
      const csv = websitesToCsv(websites);
      blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      filename = `mafati7-export-${new Date().toISOString().slice(0, 10)}.csv`;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    exportMessage.textContent = t("exportSuccess", { count: websites.length });
    exportMessage.className = "msg success";
  } catch (err) {
    exportMessage.textContent = t("exportFailed", { message: err.message });
    exportMessage.className = "msg error";
  }
}

/* ── Import ─────────────────────────────────────────────── */
async function onImport() {
  const file = importFile.files[0];
  if (!file) {
    importMessage.textContent = t("importNoFile");
    importMessage.className = "msg error";
    return;
  }

  try {
    const text = await file.text();
    let websites = [];

    if (file.name.endsWith(".json")) {
      const data = JSON.parse(text);
      websites = data.websites || [];
    } else if (file.name.endsWith(".csv")) {
      websites = csvToWebsites(text);
    } else {
      throw new Error(t("importInvalidFormat"));
    }

    if (!websites.length) {
      importMessage.textContent = t("importNoValidData");
      importMessage.className = "msg error";
      return;
    }

    // Validate each entry has required fields
    for (const w of websites) {
      if (!w.id || !w.url) {
        throw new Error(t("importInvalidEntry"));
      }
    }

    await saveWebsites(websites);
    importMessage.textContent = t("importSuccess", { count: websites.length });
    importMessage.className = "msg success";

    // Reset file input
    importFile.value = "";
  } catch (err) {
    importMessage.textContent = t("importFailed", { message: err.message });
    importMessage.className = "msg error";
  }
}

/* ── Helpers ────────────────────────────────────────────── */
function parseKeywords(raw, fallback) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return words.length ? Array.from(new Set(words)) : fallback;
}

function renderChips(raw, container) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  container.innerHTML = "";
  words.forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "keyword-chip";
    chip.textContent = word;
    container.appendChild(chip);
  });
}

function websitesToCsv(websites) {
  const header = "id,url,label,usernameEncrypted,passwordEncrypted,order";
  const rows = websites.map((w) => {
    const ue = w.usernameEncrypted
      ? `${w.usernameEncrypted.iv}:${w.usernameEncrypted.value}`
      : "";
    const pe = w.passwordEncrypted
      ? `${w.passwordEncrypted.iv}:${w.passwordEncrypted.value}`
      : "";
    return [w.id, escapeCsv(w.url), escapeCsv(w.label), ue, pe, w.order || 0].join(",");
  });
  return [header, ...rows].join("\n");
}

function csvToWebsites(csv) {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",");
  const rows = lines.slice(1);

  return rows.map((line) => {
    const values = parseCsvLine(line);
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = (values[i] || "").trim();
    });

    // Reconstruct encrypted fields
    let usernameEncrypted = null;
    let passwordEncrypted = null;
    if (obj.usernameEncrypted && obj.usernameEncrypted.includes(":")) {
      const [iv, val] = obj.usernameEncrypted.split(":");
      usernameEncrypted = { iv, value: val };
    }
    if (obj.passwordEncrypted && obj.passwordEncrypted.includes(":")) {
      const [iv, val] = obj.passwordEncrypted.split(":");
      passwordEncrypted = { iv, value: val };
    }

    return {
      id: obj.id,
      url: unescapeCsv(obj.url || ""),
      label: unescapeCsv(obj.label || obj.url || ""),
      usernameEncrypted,
      passwordEncrypted,
      order: parseInt(obj.order, 10) || Date.now()
    };
  });
}

function escapeCsv(val) {
  if (!val) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function unescapeCsv(val) {
  if (!val) return "";
  let s = val;
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/""/g, '"');
  }
  return s;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}
