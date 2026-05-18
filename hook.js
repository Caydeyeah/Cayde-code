(function () {
  'use strict';

  let siteEnabled = true;
  let receivedSettings = false;
  let tornDown = false;

  function isSiteEnabled() {
    return siteEnabled;
  }

  window.addEventListener('message', function onSettings(e) {
    if (e.source !== window) return;
    if (e.data && e.data.type === 'BU_SETTINGS') {
      siteEnabled = e.data.siteEnabled !== false;
      receivedSettings = true;
      window.removeEventListener('message', onSettings);
      if (!siteEnabled) teardown();
    }
  });

  setTimeout(() => {
    if (!receivedSettings) {
      receivedSettings = true;
    }
  }, 500);

  function teardown() {
    if (tornDown) return;
    tornDown = true;
    if (typeof _originalClick !== 'undefined') {
      HTMLInputElement.prototype.click = _originalClick;
    }
    if (typeof _originalShowOpenFilePicker !== 'undefined') {
      window.showOpenFilePicker = _originalShowOpenFilePicker;
    }
    document.removeEventListener('click', labelClickHandler, true);
    document.removeEventListener('keydown', keyHandler, true);
    const root = document.getElementById('bu-root');
    if (root) root.remove();
    const style = document.getElementById('bu-styles');
    if (style) style.remove();
  }

  const SVG_FILE = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;
  const SVG_FOLDER = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  const SVG_CLOSE = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  const SVG_CHECK = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

  const CSS = `
    #bu-root {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
      -webkit-font-smoothing: antialiased;
    }

    #bu-root.open { display: flex; }

    .bu-backdrop {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.72);
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      animation: bu-fade-in 0.2s ease;
    }

    .bu-modal {
      position: relative;
      z-index: 1;
      width: 400px;
      background: #0c0e14;
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 32px;
      box-shadow:
        0 0 0 1px rgba(255,255,255,0.03),
        0 32px 80px rgba(0,0,0,0.7),
        0 0 120px rgba(79,70,229,0.08);
      animation: bu-slide-in 0.25s cubic-bezier(0.34, 1.36, 0.64, 1);
    }

    .bu-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 28px;
    }

    .bu-icon-wrap {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      border-radius: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 8px 24px rgba(79,70,229,0.35);
    }

    .bu-title { font-size: 17px; font-weight: 700; color: #f8fafc; letter-spacing: -0.3px; }
    .bu-subtitle { font-size: 12px; color: #64748b; margin-top: 1px; }

    .bu-close {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 28px;
      height: 28px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .bu-close:hover { background: rgba(255,255,255,0.08); color: #94a3b8; }

    .bu-options { display: flex; flex-direction: column; gap: 10px; }

    .bu-option {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 18px;
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.06);
      background: rgba(255,255,255,0.02);
      cursor: pointer;
      transition: all 0.18s ease;
      text-align: left;
    }
    .bu-option:hover {
      border-color: rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      transform: translateY(-1px);
    }

    .bu-option.primary {
      border-color: rgba(79,70,229,0.4);
      background: rgba(79,70,229,0.08);
    }
    .bu-option.primary:hover {
      border-color: rgba(99,102,241,0.6);
      background: rgba(79,70,229,0.14);
    }

    .bu-opt-icon {
      width: 40px;
      height: 40px;
      border-radius: 11px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      flex-shrink: 0;
      transition: all 0.18s;
    }
    .bu-option:hover .bu-opt-icon { color: #94a3b8; }
    .bu-option.primary .bu-opt-icon {
      background: rgba(79,70,229,0.15);
      border-color: rgba(79,70,229,0.3);
      color: #818cf8;
    }

    .bu-opt-label { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .bu-opt-desc { font-size: 11px; color: #475569; margin-top: 2px; }
    .bu-option.primary .bu-opt-desc { color: #6366f1; }

    .bu-badge {
      margin-left: auto;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 99px;
      background: rgba(79,70,229,0.2);
      border: 1px solid rgba(79,70,229,0.3);
      color: #818cf8;
      flex-shrink: 0;
    }

    .bu-cancel {
      display: block;
      width: 100%;
      margin-top: 16px;
      padding: 10px;
      background: none;
      border: none;
      color: #334155;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: color 0.15s;
      font-family: inherit;
    }
    .bu-cancel:hover { color: #475569; }

    .bu-success {
      display: none;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      padding: 8px 0 16px;
    }
    .bu-success.show { display: flex; }
    .bu-check-circle {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(16,185,129,0.12);
      border: 1px solid rgba(16,185,129,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #10b981;
      animation: bu-pop 0.3s cubic-bezier(0.34,1.56,0.64,1);
    }
    .bu-success-title { font-size: 14px; font-weight: 600; color: #e2e8f0; }
    .bu-success-count { font-size: 12px; color: #10b981; }

    @keyframes bu-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes bu-slide-in {
      from { opacity: 0; transform: scale(0.94) translateY(12px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    @keyframes bu-pop {
      from { transform: scale(0.6); opacity: 0; }
      to   { transform: scale(1); opacity: 1; }
    }
  `;

  function buildUI() {
    const styleEl = document.createElement('style');
    styleEl.id = 'bu-styles';
    styleEl.textContent = CSS;

    const root = document.createElement('div');
    root.id = 'bu-root';

    root.innerHTML = `
      <div class="bu-backdrop" id="bu-backdrop"></div>
      <div class="bu-modal">
        <button class="bu-close" id="bu-close-btn" title="Cancel">${SVG_CLOSE}</button>

        <div class="bu-header">
          <div class="bu-icon-wrap">
            ${SVG_FOLDER.replace('stroke="currentColor"', 'stroke="white"')}
          </div>
          <div>
            <div class="bu-title">Bulk Uploader</div>
            <div class="bu-subtitle">Select an upload mode</div>
          </div>
        </div>

        <div class="bu-options" id="bu-options">
          <button class="bu-option" id="bu-btn-file">
            <div class="bu-opt-icon">${SVG_FILE}</div>
            <div>
              <div class="bu-opt-label">Individual Files</div>
              <div class="bu-opt-desc">Select one or more specific files</div>
            </div>
          </button>
          <button class="bu-option primary" id="bu-btn-folder">
            <div class="bu-opt-icon">${SVG_FOLDER}</div>
            <div>
              <div class="bu-opt-label">Entire Folder</div>
              <div class="bu-opt-desc">Recursive — preserves full path structure</div>
            </div>
            <span class="bu-badge">Recommended</span>
          </button>
        </div>

        <div class="bu-success" id="bu-success">
          <div class="bu-check-circle">${SVG_CHECK}</div>
          <div class="bu-success-title" id="bu-success-title">Folder selected</div>
          <div class="bu-success-count" id="bu-success-count"></div>
        </div>

        <button class="bu-cancel" id="bu-cancel-btn">Cancel</button>
      </div>
    `;

    document.documentElement.appendChild(styleEl);
    document.documentElement.appendChild(root);
    return root;
  }

  function getOrCreateUI() {
    const existing = document.getElementById('bu-root');
    if (existing) return existing;
    return buildUI();
  }

  const folderInput = document.createElement('input');
  folderInput.type = 'file';
  folderInput.webkitdirectory = true;
  folderInput.multiple = true;
  folderInput.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;';
  folderInput.setAttribute('data-bu-internal', 'true');
  document.documentElement.appendChild(folderInput);

  let activeLegacyTarget = null;
  let activeModernRequestId = null;
  const pendingModernRequests = new Map();
  const _originalShowOpenFilePicker = window.showOpenFilePicker;
  const _originalClick = HTMLInputElement.prototype.click;

  let isModalOpen = false;

  function resetState() {
    activeLegacyTarget = null;
    activeModernRequestId = null;
  }

  function showUI() {
    const root = getOrCreateUI();
    wireEvents(root);

    document.getElementById('bu-options').style.display = '';
    document.getElementById('bu-success').classList.remove('show');
    document.getElementById('bu-cancel-btn').style.display = '';

    root.classList.add('open');
    isModalOpen = true;
  }

  function hideUI() {
    const root = document.getElementById('bu-root');
    if (root) root.classList.remove('open');
    isModalOpen = false;
  }

  let _eventsWired = false;
  function wireEvents(root) {
    if (_eventsWired) return;
    _eventsWired = true;

    root.querySelector('#bu-backdrop').addEventListener('click', () => cancel());
    root.querySelector('#bu-close-btn').addEventListener('click', () => cancel());
    root.querySelector('#bu-cancel-btn').addEventListener('click', () => cancel());
    root.querySelector('#bu-btn-file').addEventListener('click', () => triggerFile());
    root.querySelector('#bu-btn-folder').addEventListener('click', () => triggerFolder());
  }

  function cancel() {
    hideUI();
    if (activeModernRequestId) {
      const req = pendingModernRequests.get(activeModernRequestId);
      if (req) {
        pendingModernRequests.delete(activeModernRequestId);
        req.reject(new DOMException('The user aborted a request.', 'AbortError'));
      }
    }
    resetState();
  }

  function triggerFile() {
    hideUI();

    if (activeModernRequestId) {
      const req = pendingModernRequests.get(activeModernRequestId);
      if (req && _originalShowOpenFilePicker) {
        pendingModernRequests.delete(activeModernRequestId);
        resetState();
        _originalShowOpenFilePicker.call(window, req.options)
          .then(req.resolve)
          .catch(req.reject);
      }
    } else if (activeLegacyTarget) {
      const target = activeLegacyTarget;
      resetState();
      if (!document.contains(target)) return;
      target.setAttribute('data-bu-bypass', 'true');
      _originalClick.call(target);
      setTimeout(() => target.removeAttribute('data-bu-bypass'), 600);
    }
  }

  function triggerFolder() {
    hideUI();
    _originalClick.call(folderInput);
  }

  folderInput.addEventListener('change', (e) => {
    const raw = Array.from(e.target.files || []);
    if (raw.length === 0) { resetState(); return; }

    const files = raw.filter(f => {
      const p = f.webkitRelativePath || f.name;
      return !p.includes('__pycache__/')
          && !p.includes('.DS_Store')
          && !p.includes('.git/')
          && !p.includes('node_modules/')
          && !p.includes('.next/')
          && !p.endsWith('.pyc');
    });

    if (files.length === 0) { resetState(); return; }

    const folderName = files[0].webkitRelativePath.split('/')[0] || 'folder';

    if (activeModernRequestId) {
      const req = pendingModernRequests.get(activeModernRequestId);
      if (req) {
        pendingModernRequests.delete(activeModernRequestId);
        resetState();
        req.resolve(files);
      }
    } else if (activeLegacyTarget) {
      const target = activeLegacyTarget;
      resetState();

      if (!document.contains(target)) return;

      const dt = new DataTransfer();
      for (const f of files) dt.items.add(f);
      target.multiple = true;
      target.files = dt.files;
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));

      showSuccessFlash(folderName, files.length);
    }

    folderInput.value = '';
  });

  function showSuccessFlash(name, count) {
    const root = getOrCreateUI();
    root.classList.add('open');
    document.getElementById('bu-options').style.display = 'none';
    document.getElementById('bu-cancel-btn').style.display = 'none';

    const successEl = document.getElementById('bu-success');
    document.getElementById('bu-success-title').textContent = `"${name}" selected`;
    document.getElementById('bu-success-count').textContent =
      `${count} file${count !== 1 ? 's' : ''} ready`;
    successEl.classList.add('show');

    setTimeout(() => hideUI(), 1400);
  }

  HTMLInputElement.prototype.click = function () {
    if (
      this.type === 'file' &&
      !this.hasAttribute('data-bu-bypass') &&
      !this.hasAttribute('data-bu-internal') &&
      !this.webkitdirectory
    ) {
      if (!isSiteEnabled() || tornDown) {
        _originalClick.call(this);
        return;
      }
      activeLegacyTarget = this;
      activeModernRequestId = null;
      showUI();
      return;
    }
    _originalClick.call(this);
  };

  if (_originalShowOpenFilePicker) {
    window.showOpenFilePicker = function (options) {
      if (!isSiteEnabled() || tornDown) {
        return _originalShowOpenFilePicker.call(window, options);
      }
      return new Promise((resolve, reject) => {
        const id = Math.random().toString(36).slice(2, 9);
        pendingModernRequests.set(id, { resolve, reject, options });
        activeModernRequestId = id;
        activeLegacyTarget = null;
        showUI();
      });
    };
  }

  function labelClickHandler(e) {
    if (!isSiteEnabled() || tornDown) return;

    const path = e.composedPath();

    const fileInput = path.find(el => {
      if (el instanceof HTMLInputElement && el.type === 'file') return true;
      if (el instanceof HTMLLabelElement && el.htmlFor) {
        const linked = document.getElementById(el.htmlFor);
        return linked instanceof HTMLInputElement && linked.type === 'file';
      }
      return false;
    });

    if (!fileInput) return;

    const actual = fileInput instanceof HTMLLabelElement
      ? document.getElementById(fileInput.htmlFor)
      : fileInput;

    if (
      actual &&
      !actual.hasAttribute('data-bu-bypass') &&
      !actual.hasAttribute('data-bu-internal') &&
      !actual.webkitdirectory
    ) {
      e.preventDefault();
      e.stopImmediatePropagation();
      activeLegacyTarget = actual;
      activeModernRequestId = null;
      showUI();
    }
  }

  document.addEventListener('click', labelClickHandler, true);

  function keyHandler(e) {
    if (!isModalOpen) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      cancel();
    }
  }

  document.addEventListener('keydown', keyHandler, true);

})();
