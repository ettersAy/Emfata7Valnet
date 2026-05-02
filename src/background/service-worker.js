// Background service worker for مفاتيح
// Mediates credential autofill operations as a security boundary.
// The popup requests autofill; the service worker verifies the hostname,
// decrypts credentials, injects the content script, and sends the fill message.

import { decryptSecret, isUnlocked } from "../common/crypto.js";
import { getFieldKeywords } from "../common/storage.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("مفاتيح installed");
});

/**
 * Handle autofill requests from the popup.
 * The service worker acts as the security boundary:
 * - Verifies hostname match
 * - Decrypts credentials
 * - Injects content script on-demand
 * - Sends fill message
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "AUTOFILL_REQUEST") return false;

  handleAutofillRequest(message.payload, sendResponse);
  return true; // Keep the message channel open for async response
});

async function handleAutofillRequest(payload, sendResponse) {
  const { tabId, websiteUrl, loginEncrypted, passwordEncrypted } = payload;

  try {
    // Verify vault is unlocked
    if (!isUnlocked()) {
      sendResponse({ success: false, error: "vault_locked" });
      return;
    }

    // Get active tab for hostname verification
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || tab.id !== tabId) {
      sendResponse({ success: false, error: "tab_mismatch" });
      return;
    }

    // Verify active tab hostname matches stored website hostname
    const tabUrl = new URL(tab.url);
    const storedHost = new URL(
      /^https?:\/\//i.test(websiteUrl) ? websiteUrl : `https://${websiteUrl}`
    ).hostname.replace(/^www\./, "");
    const tabHost = tabUrl.hostname.replace(/^www\./, "");

    if (tabHost !== storedHost) {
      sendResponse({ success: false, error: "hostname_mismatch" });
      return;
    }

    // Decrypt credentials
    const username = await decryptSecret(loginEncrypted);
    const password = await decryptSecret(passwordEncrypted);

    // Inject content script on-demand
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["src/content/autofill-content.js"]
    });

    // Send fill message
    await chrome.tabs.sendMessage(tabId, {
      type: "RUN_AUTOFILL",
      payload: {
        credential: { username, password },
        fieldKeywords: await getFieldKeywords()
      }
    });

    sendResponse({ success: true });
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}
