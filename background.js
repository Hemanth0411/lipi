chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["fontFamily"], (data) => {
    if (!data.fontFamily) {
      chrome.storage.local.set({ fontFamily: "Arial" });
    }
  });

  chrome.contextMenus.create({
    id: "lipiParent",
    title: "Lipi - Copy As",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "copyPlain",
    parentId: "lipiParent",
    title: "Plain Text",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "copyCleanFont",
    parentId: "lipiParent",
    title: "My Font - No Styling",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "copyWithFont",
    parentId: "lipiParent",
    title: "My Font - Keep Styling",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === "copyPlain") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyAsPlain
    });
  }

  if (info.menuItemId === "copyCleanFont") {
    chrome.storage.local.get(["fontFamily"], (data) => {
      const fontFamily = data.fontFamily || "Arial";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyWithFont,
        args: [fontFamily, true] // true = strip formatting
      });
    });
  }

  if (info.menuItemId === "copyWithFont") {
    chrome.storage.local.get(["fontFamily"], (data) => {
      const fontFamily = data.fontFamily || "Arial";
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: copyWithFont,
        args: [fontFamily, false] // false = keep formatting
      });
    });
  }
});

function copyAsPlain() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);

  let text = div.innerText || div.textContent || "";
  text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
  text = text.replace(/\r\n|\r/g, "\n");
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  navigator.clipboard.writeText(text).catch(err => {
    console.error("Lipi: clipboard write failed", err);
  });
}

function copyWithFont(fontFamily, stripFormatting) {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const fragment = range.cloneContents();
  const div = document.createElement("div");
  div.appendChild(fragment);

  if (stripFormatting) {
    // Just get the text but wrap it in our font
    const text = div.innerText || div.textContent || "";
    const styledHTML = `<span style="font-family: '${fontFamily}', sans-serif;">${text}</span>`;

    const item = new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([styledHTML], { type: "text/html" })
    });
    navigator.clipboard.write([item]).catch(err => console.error(err));
  } else {
    // Keep bold/italic/size but reset other styles
    div.querySelectorAll("*").forEach(el => {
      const existingSize = el.style.fontSize;
      el.removeAttribute("style");
      el.removeAttribute("class");
      el.removeAttribute("id");
      el.removeAttribute("color");
      el.removeAttribute("face");
      el.removeAttribute("size");
      if (existingSize) el.style.fontSize = existingSize;
    });

    const plainText = div.innerText || div.textContent || "";
    const styledHTML = `<span style="font-family: '${fontFamily}', sans-serif;">${div.innerHTML}</span>`;

    const item = new ClipboardItem({
      "text/plain": new Blob([plainText], { type: "text/plain" }),
      "text/html": new Blob([styledHTML], { type: "text/html" })
    });

    navigator.clipboard.write([item]).catch(err => {
      console.error("Lipi: clipboard write failed", err);
    });
  }
}
