(function () {
  "use strict";

  const root = document.querySelector(".research-page");
  if (!root) return;

  const overlay = root.querySelector(".research-overlay");
  const titleEl = root.querySelector("#researchDialogTitle");
  const closeBtn = root.querySelector(".research-dialog__close");
  const frame = root.querySelector(".research-dialog__frame");
  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opener = null;
  let prevOverflow = "";
  let closeTimer = 0;

  function openTool(button) {
    if (closeTimer) {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
    }
    opener = button;
    const title = button.getAttribute("data-title") || "";
    titleEl.textContent = title;
    frame.title = title;
    frame.src = button.getAttribute("data-src");
    overlay.hidden = false;
    prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (motionOk) {
      window.requestAnimationFrame(function () {
        overlay.classList.add("is-open");
      });
    } else {
      overlay.classList.add("is-open");
    }
    closeBtn.focus();
  }

  function finishClose() {
    overlay.hidden = true;
    frame.src = "about:blank";
    frame.title = "";
    titleEl.textContent = "";
    if (opener) opener.focus();
  }

  function closeTool() {
    if (overlay.hidden) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = prevOverflow;
    if (motionOk) {
      closeTimer = window.setTimeout(finishClose, 200);
    } else {
      finishClose();
    }
  }

  root.querySelectorAll(".research-card").forEach(function (button) {
    button.addEventListener("click", function () {
      openTool(button);
    });
  });

  closeBtn.addEventListener("click", closeTool);
  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeTool();
  });
  document.addEventListener("keydown", function (event) {
    if (overlay.hidden || event.key !== "Escape") return;
    event.preventDefault();
    closeTool();
  });
})();
