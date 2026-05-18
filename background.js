chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ disabledSites: [] });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SITE_STATUS') {
    chrome.storage.local.get(['disabledSites'], (result) => {
      const disabled = result.disabledSites || [];
      sendResponse({ enabled: !disabled.includes(message.hostname) });
    });
    return true;
  }

  if (message.type === 'TOGGLE_SITE') {
    chrome.storage.local.get(['disabledSites'], (result) => {
      let disabled = result.disabledSites || [];
      if (message.enable) {
        disabled = disabled.filter(s => s !== message.hostname);
      } else {
        if (!disabled.includes(message.hostname)) {
          disabled.push(message.hostname);
        }
      }
      chrome.storage.local.set({ disabledSites: disabled }, () => {
        sendResponse({ success: true, enabled: message.enable });
      });
    });
    return true;
  }
});
