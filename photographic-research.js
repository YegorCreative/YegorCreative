(function () {
  "use strict";

  const root = document.querySelector(".research-page");
  if (!root) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fitFrame(frame) {
    if (frame._fitting) return;
    const doc = frame.contentDocument;
    if (!doc || !doc.body || !doc.documentElement) return;
    frame._fitting = true;
    const previous = frame.style.height;
    frame.style.height = "0px";
    const next = Math.ceil(Math.max(doc.documentElement.scrollHeight || 0, doc.body.scrollHeight || 0));
    const target = next + "px";
    frame.style.height = next > 0 ? target : previous;
    frame._fitting = false;
  }

  function watchViewer(frame, doc) {
    const viewer = doc.getElementById("lb");
    if (!viewer || frame.dataset.viewer === "true") return;
    frame.dataset.viewer = "true";

    function showViewerTop() {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      frame.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
    }

    doc.addEventListener("click", function (event) {
      const opener = event.target.closest && event.target.closest("[data-i]");
      if (!opener || viewer.hidden) return;
      if (frame.requestFullscreen) {
        frame.requestFullscreen().catch(showViewerTop);
      } else {
        showViewerTop();
      }
    });

    const viewerWatch = new MutationObserver(function () {
      if (viewer.hidden && document.fullscreenElement === frame) {
        document.exitFullscreen().catch(function () {});
      }
    });
    viewerWatch.observe(viewer, { attributes: true, attributeFilter: ["hidden"] });
  }

  function watchFrame(frame) {
    frame.addEventListener("load", function () {
      fitFrame(frame);
      const doc = frame.contentDocument;
      if (!doc || !doc.body) return;
      watchViewer(frame, doc);
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(function () {
        fitFrame(frame);
      });
      observer.observe(doc.documentElement);
      observer.observe(doc.body);
    });
  }

  function loadFrame(frame) {
    if (frame.dataset.loaded === "true") return;
    frame.dataset.loaded = "true";
    frame.src = frame.getAttribute("data-src");
  }

  root.querySelectorAll(".research-frame").forEach(watchFrame);

  root.querySelectorAll(".research-item").forEach(function (item) {
    const button = item.querySelector(".research-toggle");
    const panel = item.querySelector(".research-panel");
    const frame = item.querySelector(".research-frame");
    let hideTimer = 0;

    function open() {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
        hideTimer = 0;
      }
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      loadFrame(frame);
      if (reduceMotion) {
        panel.classList.add("is-open");
      } else {
        window.requestAnimationFrame(function () {
          panel.classList.add("is-open");
        });
      }
    }

    function close() {
      button.setAttribute("aria-expanded", "false");
      panel.classList.remove("is-open");
      if (reduceMotion) {
        panel.hidden = true;
        return;
      }
      const finish = function () {
        if (button.getAttribute("aria-expanded") === "true") return;
        panel.hidden = true;
      };
      panel.addEventListener("transitionend", function onEnd(event) {
        if (event.propertyName !== "grid-template-rows") return;
        panel.removeEventListener("transitionend", onEnd);
        finish();
      });
      hideTimer = window.setTimeout(finish, 400);
    }

    button.addEventListener("click", function () {
      if (button.getAttribute("aria-expanded") === "true") close();
      else open();
    });
  });
})();
