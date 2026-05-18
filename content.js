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

    script.onload = () => {
      const hostname = window.location.hostname;
      try {
        chrome.storage.local.get(['disabledSites'], (result) => {
          const disabled = (result && result.disabledSites) || [];
          const siteEnabled = !disabled.includes(hostname);
          window.postMessage({ type: 'BU_SETTINGS', siteEnabled, hostname }, '*');
        });
      } catch (e) {
        window.postMessage({ type: 'BU_SETTINGS', siteEnabled: true, hostname }, '*');
      }
    };

    target.appendChild(script);
  }

  let attempts = 0;
  function tryInject() {
    const target = document.head || document.documentElement;
    if (target) {
      inject();
    } else {
      attempts++;
      if (attempts < 100) {
        setTimeout(tryInject, 300);
      }
    }
  }

  tryInject();
})();
