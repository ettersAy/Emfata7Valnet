import { getWebsites, getFieldKeywords } from "../common/storage.js";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "AUTOFILL_CREDENTIAL") {
    void handleAutofill(message.payload, sender).then(sendResponse);
    return true;
  }
  return false;
});

async function handleAutofill(payload, sender) {
  if (!sender.tab?.id) {
    return { ok: false, reason: "No sender tab." };
  }

  const [websites, fieldKeywords] = await Promise.all([getWebsites(), getFieldKeywords()]);
  const website = websites.find((item) => item.id === payload.websiteId);
  const credential = website?.credentials.find((item) => item.id === payload.credentialId);

  if (!website || !credential) {
    return { ok: false, reason: "Credential not found." };
  }

  await chrome.tabs.sendMessage(sender.tab.id, {
    type: "RUN_AUTOFILL",
    payload: { credential, fieldKeywords }
  });

  return { ok: true };
}
