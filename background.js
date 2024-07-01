chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        console.log("SEO Backlink Analyzer extension installed.");
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE) {
        console.log("SEO Backlink Analyzer extension updated.");
    }
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting
        .executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
        })
        .then(() => {
            console.log("Content script injected.");
        })
        .catch((error) => {
            console.error("Failed to inject content script:", error);
        });
});
