import { DEFAULT_FIELD_KEYWORDS } from "../common/constants.js";
import { getFieldKeywords, saveFieldKeywords } from "../common/storage.js";

const userKeywords = document.getElementById("userKeywords");
const passwordKeywords = document.getElementById("passwordKeywords");
const saveMessage = document.getElementById("saveMessage");

document.getElementById("saveSettings").addEventListener("click", onSave);

await load();

async function load() {
  const settings = await getFieldKeywords();
  userKeywords.value = settings.user.join(", ");
  passwordKeywords.value = settings.password.join(", ");
}

async function onSave() {
  const next = {
    user: parseKeywords(userKeywords.value, DEFAULT_FIELD_KEYWORDS.user),
    password: parseKeywords(passwordKeywords.value, DEFAULT_FIELD_KEYWORDS.password)
  };

  await saveFieldKeywords(next);
  saveMessage.textContent = "Saved.";
}

function parseKeywords(raw, fallback) {
  const words = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return words.length ? Array.from(new Set(words)) : fallback;
}
