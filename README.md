# Lipi
**Lipi** (Sanskrit: लिपि — *script, written form*) is a Chrome extension that lets you 
copy text from any webpage and paste it in your preferred font.

[![Ko-fi](https://img.shields.io/badge/Support-Ko--fi-ff5e5b?style=flat&logo=ko-fi)](https://ko-fi.com/hemanth0411)

## What it does
- Right-click any selected text → "Lipi — Copy As"
- **Plain Text** — strips all formatting
- **My Font — No Styling** — applies your font, removes bold/italic
- **My Font — Keep Styling** — applies your font, keeps bold/italic/size

## Install
[Chrome Web Store](#) ← link after publishing

## Local Development
1. Clone this repo
2. Go to chrome://extensions
3. Enable Developer Mode
4. Click Load Unpacked → select this folder

## Known Limitations
- Does not work on chrome:// pages (Chrome platform restriction)
- Desktop Word paste behavior depends on user's paste mode settings

## Roadmap (v2.0)
- **Keyboard Shortcuts**: Execute "Copy as Plain Text" or "Copy with Font" via hotkeys.
- **Clipboard History**: Optional local storage of recent copies to re-format them later.
- **Sticky Mode**: Option to automatically apply Lipi font to all standard copies.

## Privacy
No data is collected. No network requests are made. 
All preferences stored locally on your device via chrome.storage.local.
If Clipboard History (v2) is enabled, recent copies are stored only on your local device.

## License
[MIT](LICENSE)