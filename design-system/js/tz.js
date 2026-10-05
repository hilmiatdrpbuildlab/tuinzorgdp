/* TuinZorg DP design system · behaviour for the interactive components.
   Plain script, no dependencies. Exposes window.TZ.init(root) and runs it once on load.
   Every part is opt-in through data attributes or component classes, and init is safe to call twice.
   In SvelteKit each block becomes the component's own script; this file is the reference behaviour. */
(function () {
  function each(root, sel, fn) {
    Array.prototype.forEach.call(root.querySelectorAll(sel), function (el) {
      if (el.dataset.tzReady) return;
      el.dataset.tzReady = "1";
      fn(el);
    });
  }

  // Header: .tz-menu-btn opens the .tz-drawer; Escape closes it; .is-scrolled adds the shadow.
  function header(h) {
    var btn = h.querySelector(".tz-menu-btn");
    if (btn) {
      btn.addEventListener("click", function () {
        var open = !h.hasAttribute("data-open");
        h.toggleAttribute("data-open", open);
        btn.setAttribute("aria-expanded", open ? "true" : "false");
        btn.setAttribute("aria-label", open ? "Menu sluiten" : "Menu openen");
      });
      h.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && h.hasAttribute("data-open")) { btn.click(); btn.focus(); }
      });
    }
    var onScroll = function () { h.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Gallery filter: [data-tz-filter="galleryId"] holding .tz-tag buttons with value="category" ("" = all).
  function filter(box) {
    var tags = Array.prototype.slice.call(box.querySelectorAll(".tz-tag"));
    var gallery = document.getElementById(box.getAttribute("data-tz-filter"));
    tags.forEach(function (t) {
      t.addEventListener("click", function () {
        tags.forEach(function (o) { o.setAttribute("aria-pressed", o === t ? "true" : "false"); });
        if (!gallery) return;
        Array.prototype.forEach.call(gallery.querySelectorAll("[data-cat]"), function (item) {
          item.hidden = !!t.value && item.getAttribute("data-cat") !== t.value;
        });
      });
    });
  }

  // Lightbox: buttons .tz-shot[data-full] inside [data-tz-gallery] open <dialog class="tz-lightbox">.
  function gallery(g) {
    var dlg = document.getElementById(g.getAttribute("data-tz-gallery"));
    if (!dlg || !dlg.showModal) return;
    var img = dlg.querySelector(".tz-lightbox__img");
    var cap = dlg.querySelector("[data-tz-cap]");
    var cat = dlg.querySelector("[data-tz-capcat]");
    var shots = function () { return Array.prototype.filter.call(g.querySelectorAll(".tz-shot"), function (s) { return !s.closest("[hidden]"); }); };
    var i = 0, opener = null;
    function show(n) {
      var list = shots(); if (!list.length) return;
      i = (n + list.length) % list.length;
      var s = list[i], im = s.querySelector("img");
      img.src = s.getAttribute("data-full") || (im && im.src) || "";
      img.alt = im ? im.alt : "";
      if (cap) cap.textContent = s.getAttribute("data-title") || (im ? im.alt : "");
      if (cat) cat.textContent = s.getAttribute("data-cat") || "";
    }
    g.addEventListener("click", function (e) {
      var s = e.target.closest(".tz-shot"); if (!s) return;
      opener = s; show(shots().indexOf(s)); dlg.showModal();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
      var b = e.target.closest("[data-tz-step]");
      if (b) show(i + Number(b.getAttribute("data-tz-step")));
    });
    dlg.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") show(i + 1);
      if (e.key === "ArrowLeft") show(i - 1);
    });
    dlg.addEventListener("close", function () { if (opener) opener.focus(); });
  }

  // Segmented tabs: [data-tz-tabs] with role="tab" buttons (aria-controls) and role="tabpanel" panels.
  function tabs(box) {
    var list = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      list.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    list.forEach(function (tab, n) {
      tab.addEventListener("click", function () { select(tab, false); });
      tab.addEventListener("keydown", function (e) {
        var next = e.key === "ArrowRight" ? n + 1 : e.key === "ArrowLeft" ? n - 1 : null;
        if (next === null) return;
        e.preventDefault();
        select(list[(next + list.length) % list.length], true);
      });
    });
  }

  // Forms: [data-tz-form] validates [required] fields (and .tz-field[data-tz-group] checkbox groups) on submit, focuses the first error and swaps to [data-tz-success].
  // Replace the timeout with the SvelteKit form action (POST /offerte → leads table) when the site is built.
  function form(f) {
    f.setAttribute("novalidate", "");
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = null;
      Array.prototype.forEach.call(f.querySelectorAll(".tz-field"), function (field) {
        var group = field.hasAttribute("data-tz-group");
        var inputs = field.querySelectorAll(group ? "input" : "[required]");
        if (!inputs.length) return;
        var bad = group
          ? !Array.prototype.some.call(inputs, function (c) { return c.checked; })
          : Array.prototype.some.call(inputs, function (i) { return !i.checkValidity(); });
        field.classList.toggle("tz-field--error", bad);
        Array.prototype.forEach.call(inputs, function (i) { i.setAttribute("aria-invalid", bad ? "true" : "false"); });
        if (bad && !first) first = inputs[0];
      });
      if (first) { first.focus(); return; }
      var btn = f.querySelector('[type="submit"]');
      if (btn) { btn.classList.add("is-loading"); btn.setAttribute("aria-busy", "true"); }
      setTimeout(function () {
        var done = f.parentElement.querySelector("[data-tz-success]");
        if (btn) { btn.classList.remove("is-loading"); btn.removeAttribute("aria-busy"); }
        if (done) { f.hidden = true; done.hidden = false; done.focus(); }
      }, 700);
    });
    f.addEventListener("input", function (e) { clear(e.target); });
    f.addEventListener("change", function (e) { clear(e.target); });
    function clear(t) {
      var field = t.closest && t.closest(".tz-field--error");
      if (!field) return;
      var ok = field.hasAttribute("data-tz-group") ? Array.prototype.some.call(field.querySelectorAll("input"), function (c) { return c.checked; }) : t.checkValidity();
      if (ok) { field.classList.remove("tz-field--error"); t.setAttribute("aria-invalid", "false"); }
    }
  }

  // Character count: textarea[data-tz-count] updates the element with id = its value.
  function counter(t) {
    var out = document.getElementById(t.getAttribute("data-tz-count"));
    var max = t.getAttribute("maxlength");
    var sync = function () { if (out) out.textContent = t.value.length + (max ? " / " + max : ""); };
    t.addEventListener("input", sync); sync();
  }

  // Drop zone: .tz-drop highlights while a file is dragged over it and lists the chosen file names.
  function drop(z) {
    ["dragenter", "dragover"].forEach(function (n) { z.addEventListener(n, function () { z.classList.add("is-over"); }); });
    ["dragleave", "drop"].forEach(function (n) { z.addEventListener(n, function () { z.classList.remove("is-over"); }); });
    var input = z.querySelector("input[type=file]"), list = z.querySelector("[data-tz-files]");
    if (input && list) input.addEventListener("change", function () {
      list.textContent = Array.prototype.map.call(input.files, function (f) { return f.name; }).join(", ");
    });
  }

  // Dismiss: any [data-tz-dismiss] button removes its closest .tz-toast or .tz-alert.
  function dismiss(btn) {
    btn.addEventListener("click", function () {
      var el = btn.closest(".tz-toast, .tz-alert");
      if (el) el.remove();
    });
  }

  function init(root) {
    root = root || document;
    each(root, ".tz-header", header);
    each(root, "[data-tz-filter]", filter);
    each(root, "[data-tz-gallery]", gallery);
    each(root, "[data-tz-tabs]", tabs);
    each(root, "[data-tz-form]", form);
    each(root, "[data-tz-count]", counter);
    each(root, ".tz-drop", drop);
    each(root, "[data-tz-dismiss]", dismiss);
  }

  window.TZ = { init: init, version: "1.0.0" };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { init(document); });
  else init(document);
})();
