// Background service worker for مفاتيح
// Currently the popup communicates directly with content scripts.
// This worker is ready for future background-driven features.

chrome.runtime.onInstalled.addListener(() => {
  console.log("مفاتيح installed");
});
