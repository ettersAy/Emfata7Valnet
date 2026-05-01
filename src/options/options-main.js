import { DEFAULT_FIELD_KEYWORDS } from "../common/constants.js";
import { getFieldKeywords, saveFieldKeywords } from "../common/storage.js";

const userKeywords = document.getElementById("userKeywords");
const passwordKeywords = document.getElementById("passwordKeywords");
const saveMessage = document.getElementById("saveMessage");
const userPreview = document.getElementById("userKeywordPreview");
const passwordPreview = document.getElementById("passwordKeywordPreview");

document.getElementById("saveSettings").addEventListener("click", onSave);
userKeywords.addEventListener("input", () => renderChips(userKeywords.value, userPreview));
passwordKeywords.addEventListener("input", () => renderChips(passwordKeywords.value, passwordPreview));

await load();

async function load() {
  const settings = await getFieldKeywords();
  userKeywords.value = settings.user.join(", ");
  passwordKeywords.value = settings.password.join(", ");
  renderChips(userKeywords.value, userPreview);
  renderChips(passwordKeywords.value, passwordPreview);
}

async function onSave() {
  const next = {
    user: parseKeywords(userKeywords.value, DEFAULT_FIELD_KEYWORDS.user),
    password: parseKeywords(passwordKeywords.value, DEFAULT_FIELD_KEYWORDS.password)
  };

  await saveFieldKeywords(next);

  saveMessage.textContent = "✅ Settings saved successfully.";
  saveMessage.className = "success";

  setTimeout(() => {
    saveMessage.textContent = "";
    saveMessage.className = "";
  }, 2500);
}

function parseKeywords(raw, fallback) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return words.length ? Array.from(new Set(words)) : fallback;
}

/**
 * Render live keyword chips from the textarea input.
 */
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
