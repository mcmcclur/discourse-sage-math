import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("0.14.1", api => {
  if (!window.__resizeDone) {
    window.addEventListener("message", (ev) => {
      const data = ev.data || {};
      if (!data.__sagecellHeight || !data.__sagecellId) return;
      const iframe = document.querySelector(
        `iframe[data-sagecell-id="${data.__sagecellId}"]`
      );
      if (iframe) {
        const desired = Math.max(180, Math.min(2000, data.__sagecellHeight + 16));
        const current = parseInt(iframe.style.height || "0", 10);
        if (Math.abs(desired - current) > 6) {
          iframe.style.height = desired + "px";
        }
      }
    });
    window.__resizeDone = true;
  }

  api.decorateCookedElement((cooked) => {
    const blocks = cooked.querySelectorAll('pre code.lang-sage, pre code.language-sage');
    blocks.forEach((codeblock, idx) => {
      console.log(['codeblock is', codeblock])
      const code = codeblock.textContent;
      const pre = codeblock.closest("pre");
      if (!pre) return;
      const nonce = getParentNonce();
      const id = "sagecell-" + Math.random().toString(36).slice(2) + "-" + idx;
      const srcdoc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style nonce="${nonce}">
    html, body { margin: 0; padding: 0; width: 100%; }
    div.sagecell_permalink, button.sagecell_fullScreen { display: none !important; }
    body { background: #fff; color: #111; }
    .sagecell_output_elements { background: #fff !important; color: #111 !important; }
    .sagecell_output_elements pre, .sagecell_output_elements code { color: inherit !important; }
    #cell { margin: 0; }
    #diag { font: 12px/1.3 system-ui, -apple-system, Segoe UI, sans-serif; padding: 6px; color: #555; display:none; }
  </style>
  <script nonce="${nonce}">
    function logUp(msg) {
      try { parent.postMessage({ __sagecellLog: msg, __sagecellId: "${id}" }, "*"); } catch (_) {}
      var d = document.getElementById('diag'); if (d) { d.style.display='block'; d.textContent = String(msg); }
    }
    (function(){
      function postHeight() {
        var h = 0;
        if (document.body) {
          var r = document.body.getBoundingClientRect();
          h = Math.ceil(r.height);
        } else {
          var de = document.documentElement;
          h = Math.max(de.scrollHeight, de.offsetHeight, de.clientHeight);
        }
        try { parent.postMessage({ __sagecellHeight: h, __sagecellId: "${id}" }, "*"); } catch (_) {}
      }
      function initResize() {
        postHeight();
        var lastH = 0;
        var rafScheduled = false;
        var ro = new ResizeObserver(function() {
          if (rafScheduled) return;
          rafScheduled = true;
          requestAnimationFrame(function() {
            rafScheduled = false;
            var h = document.body ? Math.ceil(document.body.getBoundingClientRect().height) : 0;
            if (h && Math.abs(h - lastH) > 2) {
              lastH = h;
              postHeight();
            }
          });
        });
        if (document.body) {
          ro.observe(document.body);
        } else {
          var iv = setInterval(function(){
            if (document.body) {
              clearInterval(iv);
              ro.observe(document.body);
              postHeight();
            }
          }, 50);
          setTimeout(function(){ clearInterval(iv); }, 3000);
        }
        window.addEventListener("load", function() {
          setTimeout(postHeight, 300);
          setTimeout(postHeight, 1200);
        });
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initResize);
      } else {
        initResize();
      }
    })();
    window.addEventListener('error', function(e) {
      var msg = e && e.error && e.error.stack ? e.error.stack : (e.message || String(e));
      logUp("iframe error: " + msg);
    });
    window.addEventListener('unhandledrejection', function(e) {
      var r = e && e.reason; logUp("iframe unhandledrejection: " + (r && r.stack ? r.stack : String(r)));
    });
  </script>
  <script nonce="${nonce}" src="https://sagecell.sagemath.org/static/embedded_sagecell.js"></script>
</head>
<body>
  <div id="cell"></div>
  <div id="diag"></div>
  <script nonce="${nonce}">
    if (!window.sagecell) {
      logUp('embedded_sagecell.js did not define window.sagecell (blocked or runtime error).');
    } else {
      try {
        sagecell.makeSagecell({
          inputLocation: "#cell",
          evalButtonText: "Run",
          hide: false,
          linked: false,
          code: ${JSON.stringify(code)}
        });
      } catch (e) {
        logUp('Sage init exception: ' + (e && e.stack ? e.stack : String(e)));
      }
    }
  </script>
</body>
</html>`;
      const iframe = document.createElement("iframe");
      iframe.setAttribute("data-sagecell-id", id);
      iframe.setAttribute("title", "SageCell");
      iframe.setAttribute("loading", "lazy");
      iframe.setAttribute(
        "sandbox",
        "allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
      );
      iframe.style.display = "block";
      iframe.style.width = "100%";
      iframe.style.marginLeft = 'auto';
      iframe.style.marginRight = 'auto';
      iframe.style.border = "1px solid #ccc";
      iframe.style.height = "350px";
      iframe.srcdoc = srcdoc;
      pre.parentNode.replaceChild(iframe, pre);
    });
  }, { id: "sage-cell-iframe-transformer" });
});

function getParentNonce() {
  const s = document.querySelector("script[nonce]");
  if (s && s.nonce) return s.nonce;
  const m = document.querySelector('meta[name="csp-nonce"]');
  if (m && m.content) return m.content;
  return "";
}
