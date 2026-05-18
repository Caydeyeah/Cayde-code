chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.sync.set({ disabledSites: [] });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_SITE_STATUS') {
    const hostname = message.hostname;
    chrome.storage.sync.get(['disabledSites'], (result) => {
      const disabled = result.disabledSites || [];
      sendResponse({ enabled: !disabled.includes(hostname) });
    });
    return true;
  }

  if (message.type === 'TOGGLE_SITE') {
    const hostname = message.hostname;
    const enable = message.enable;
    chrome.storage.sync.get(['disabledSites'], (result) => {
      let disabled = result.disabledSites || [];
      if (enable) {
        disabled = disabled.filter(s => s !== hostname);
      } else {
        if (!disabled.includes(hostname)) {
          disabled.push(hostname);
        }
      }
      chrome.storage.sync.set({ disabledSites: disabled }, () => {
        sendResponse({ success: true, enabled: enable });
      });
    });
    return true;
  }
});
