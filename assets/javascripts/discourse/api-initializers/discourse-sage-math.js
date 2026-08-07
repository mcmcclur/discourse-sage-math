import { apiInitializer } from "discourse/lib/api";
import loadScript from "discourse/lib/load-script";
import { i18n } from "discourse-i18n";

const SAGECELL_SCRIPT_URL =
  "https://sagecell.sagemath.org/static/embedded_sagecell.js";

let sageCellPromise;

function loadSageCell() {
  sageCellPromise ??= loadScript(SAGECELL_SCRIPT_URL, { scriptTag: true });
  return sageCellPromise;
}

function cellCode(cell) {
  return cell.querySelector(".discourse-sage-math__source")?.textContent;
}

function outputElement(cell) {
  return cell.querySelector(".discourse-sage-math__output");
}

function setOutputMessage(output, message, state) {
  output.replaceChildren();
  output.dataset.sageMathState = state;

  const messageElement = document.createElement("div");
  messageElement.classList.add("discourse-sage-math__message");
  messageElement.textContent = message;
  output.appendChild(messageElement);
}

function ensureOutputId(output) {
  if (!output.id) {
    output.id = `discourse-sage-math-${crypto.randomUUID()}`;
  }

  return output.id;
}

async function initializeCell(cell) {
  if (cell.dataset.sageMathInitialized) {
    return;
  }

  const code = cellCode(cell);
  const output = outputElement(cell);

  if (!code || !output) {
    return;
  }

  cell.dataset.sageMathInitialized = "true";
  setOutputMessage(output, i18n("discourse_sage_math.loading"), "loading");

  try {
    await loadSageCell();

    if (!window.sagecell) {
      throw new Error("SageCell script loaded without window.sagecell");
    }

    output.replaceChildren();
    output.dataset.sageMathState = "ready";

    window.sagecell.makeSagecell({
      inputLocation: `#${ensureOutputId(output)}`,
      evalButtonText: i18n("discourse_sage_math.run"),
      hide: false,
      linked: false,
      code,
    });
  } catch {
    cell.dataset.sageMathInitialized = "";
    setOutputMessage(output, i18n("discourse_sage_math.load_error"), "error");
  }
}

export default apiInitializer((api) => {
  api.decorateCookedElement((element) => {
    element
      .querySelectorAll(".discourse-sage-math")
      .forEach((cell) => initializeCell(cell));
  });
});
