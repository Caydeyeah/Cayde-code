# Bulk Uploader

A Chrome extension that lets you upload entire folder trees to any website. Intercepts file inputs and offers two modes: individual file picking or recursive folder upload with full path structure preserved.

## Features

- **Folder mode** — Pick a folder and upload its entire tree. Directory structure is preserved via `webkitRelativePath`.
- **File mode** — Standard multi-file picker, same as a normal upload.
- **Works everywhere** — Intercepts `<input type="file">` clicks and the File System Access API (`showOpenFilePicker`) on any site.
- **No data exfiltration** — Files are injected directly into the page's file input. Nothing is sent to any server.
- **Per-site toggle** — Disable the extension on specific sites from the popup if it interferes with downloads or other functionality.
- **Escape to dismiss** — Press Escape to cancel the upload modal.

## How it works

The extension injects a small script (`hook.js`) into every page at `document_start`. This script intercepts:

1. `HTMLInputElement.prototype.click` — any programmatic click on a file input
2. `window.showOpenFilePicker` — the modern File System Access API
3. Click events on `<label>` elements targeting file inputs

Instead of opening the native file picker, it shows a modal asking you to choose **Files** or **Folder** mode. Folder mode uses a hidden `<input webkitdirectory>` to read the full directory tree, then maps the files onto the original input.

## Installation (unpacked)

```bash
git clone https://github.com/Caydeyeah/Bulk-Uploader.git
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the cloned directory

## Popup controls

Click the extension icon to open the popup:

- **Current site** toggle — enable or disable Bulk Uploader on the active tab. Disabling restores all original browser APIs so the site behaves normally.
- **Status indicator** — green dot confirms the engine is active.

## Development

```bash
npm install
npm run dev     # starts Vite dev server on port 3000
npm run build   # builds the React popup
npm run clean   # removes dist directory
```

The popup UI is a React + Vite + Tailwind app. The core interception logic is in `hook.js` (no framework, injected directly into the page).

## Files

| File | Purpose |
|---|---|
| `hook.js` | Main engine — intercepts file inputs, shows modal, handles folder selection |
| `content.js` | Content script — injects `hook.js` into the page, passes per-site settings |
| `background.js` | Service worker — manages per-site settings via `chrome.storage.local` |
| `manifest.json` | Extension manifest |
| `src/` | Popup UI (React + Vite) |

## Why a per-site toggle?

Some websites use hidden file inputs as part of their download mechanism. Overriding `HTMLInputElement.prototype.click` on those sites would intercept the download and show the Bulk Uploader modal instead, breaking the download. The per-site toggle lets you disable the extension on those sites with one click, restoring all original browser behavior.

## License

MIT
