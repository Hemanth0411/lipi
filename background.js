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
  div.style.position = "absolute";
  div.style.left = "-9999px";
  div.appendChild(fragment);
  document.body.appendChild(div);

  let text = div.innerText || div.textContent || "";
  document.body.removeChild(div);

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
  
  // Hide the element from view and layout
  div.style.all = "initial";
  div.style.position = "fixed";
  div.style.left = "-10000px";
  div.style.top = "0";
  div.style.whiteSpace = "pre-wrap"; // Preserve newlines for innerText

  div.appendChild(fragment);
  document.body.appendChild(div);

  if (stripFormatting) {
    let text = div.innerText || div.textContent || "";
    document.body.removeChild(div);

    // Normalize newlines to match Plain Text behavior
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
    text = text.replace(/\r\n|\r/g, "\n");
    text = text.replace(/\n{3,}/g, "\n\n").trim();

    // Wrap in span with font and pre-wrap to keep newlines
    const styledHTML = `<span style="font-family: '${fontFamily}', sans-serif; white-space: pre-wrap;">${text}</span>`;
    
    const item = new ClipboardItem({
      "text/plain": new Blob([text], { type: "text/plain" }),
      "text/html": new Blob([styledHTML], { type: "text/html" })
    });
    navigator.clipboard.write([item]).catch(err => console.error(err));
  } else {
    const plainText = div.innerText || div.textContent || "";
    
    // Capture computed styles while the div is mounted to the DOM
    const elements = div.querySelectorAll("*");
    const computedData = Array.from(elements).map(el => {
      const s = window.getComputedStyle(el);
      return {
        fontSize: s.fontSize,
        fontWeight: s.fontWeight,
        fontStyle: s.fontStyle,
        textAlign: s.textAlign,
        display: s.display
      };
    });

    // Clean up "noise" and re-apply essential styles as inline
    elements.forEach((el, i) => {
      const data = computedData[i];
      el.removeAttribute("style");
      el.removeAttribute("class");
      el.removeAttribute("id");
      el.removeAttribute("color");
      el.removeAttribute("face");
      el.removeAttribute("size");
      
      el.style.fontSize = data.fontSize;
      el.style.fontWeight = data.fontWeight;
      el.style.fontStyle = data.fontStyle;
      
      // Only apply alignment if it's not the default
      if (data.textAlign !== "start" && data.textAlign !== "left") {
        el.style.textAlign = data.textAlign;
      }
      
      // Preserve block display for layout consistency
      if (data.display === "block" || data.display === "flex") {
        el.style.display = data.display;
      }
    });

    const htmlContent = div.innerHTML;
    document.body.removeChild(div);

    // Use span wrapper to avoid breaking line layout in rich editors
    const styledHTML = `<span style="font-family: '${fontFamily}', sans-serif;">${htmlContent}</span>`;

    const item = new ClipboardItem({
      "text/plain": new Blob([plainText], { type: "text/plain" }),
      "text/html": new Blob([styledHTML], { type: "text/html" })
    });

    navigator.clipboard.write([item]).catch(err => {
      console.error("Lipi: clipboard write failed", err);
    });
  }
}
