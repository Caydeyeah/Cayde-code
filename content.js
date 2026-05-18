(function () {
  function inject() {
    const target = document.head || document.documentElement;
    if (!target) {
      setTimeout(inject, 10);
      return;
    }

    const old = document.querySelector('script[data-bu-hook]');
    if (old) old.remove();

    const script = document.createElement('script');
    script.setAttribute('data-bu-hook', 'true');
    script.src = chrome.runtime.getURL('hook.js') + '?v=' + chrome.runtime.getManifest().version;

    script.onerror = () => {
      console.warn('[Bulk Uploader] Failed to inject hook.js');
    };

    // Once hook.js loads, tell it whether this site is enabled
    script.onload = () => {
      const hostname = window.location.hostname;
      chrome.storage.sync.get(['disabledSites'], (result) => {
        const disabled = result.disabledSites || [];
        const siteEnabled = !disabled.includes(hostname);
        window.postMessage({
          type: 'BU_SETTINGS',
          siteEnabled,
          hostname,
        }, '*');
      });
    };

    target.appendChild(script);
  }

  // Retry up to 30s, then give up
  let attempts = 0;
  const MAX_ATTEMPTS = 100;
  function tryInject() {
    const target = document.head || document.documentElement;
    if (target) {
      inject();
    } else {
      attempts++;
      if (attempts < MAX_ATTEMPTS) {
        setTimeout(tryInject, 300);
      }
    }
  }

  tryInject();
})();
