const FONT_LIST = [
  "Arial", "Arial Black", "Arial Narrow",
  "Calibri", "Cambria", "Candara", "Century Gothic",
  "Comic Sans MS", "Consolas", "Constantia", "Corbel",
  "Courier New", "Franklin Gothic Medium",
  "Garamond", "Georgia", "Gill Sans",
  "Helvetica", "Impact",
  "Lucida Console", "Lucida Sans Unicode",
  "Microsoft Sans Serif", "Palatino Linotype",
  "Segoe UI", "Tahoma", "Times New Roman",
  "Trebuchet MS", "Verdana",
  "Baskerville", "Didot", "Futura",
  "Hoefler Text", "Menlo", "Monaco",
  "Optima", "Andale Mono"
];

function isFontAvailable(font) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const test = "mmmmmmmmmmlli";
  ctx.font = `72px monospace`;
  const base = ctx.measureText(test).width;
  ctx.font = `72px '${font}', monospace`;
  return ctx.measureText(test).width !== base;
}

const selectEl = document.getElementById("fontFamily");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

const available = FONT_LIST.filter(isFontAvailable);

selectEl.innerHTML = "";

if (available.length === 0) {
  const opt = document.createElement("option");
  opt.value = "Arial";
  opt.textContent = "Arial (fallback)";
  selectEl.appendChild(opt);
} else {
  available.forEach(font => {
    const opt = document.createElement("option");
    opt.value = font;
    opt.textContent = font;
    opt.style.fontFamily = font;
    selectEl.appendChild(opt);
  });
}

chrome.storage.local.get(["fontFamily"], (data) => {
  if (data.fontFamily && available.includes(data.fontFamily)) {
    selectEl.value = data.fontFamily;
  }
});

saveBtn.addEventListener("click", () => {
  const fontFamily = selectEl.value;
  if (!fontFamily) return;

  chrome.storage.local.set({ fontFamily }, () => {
    statusEl.textContent = "Saved";
    setTimeout(() => { statusEl.textContent = ""; }, 1500);
  });
});
