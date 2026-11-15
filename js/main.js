(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- opener: brand splash, lifts away once the page has loaded ---------- */
  const opener = document.getElementById("opener");
  if (opener) {
    const started = performance.now();
    const MIN = reduce ? 900 : 1700;
    const finish = () => setTimeout(() => {
      opener.classList.add("done");
      document.body.classList.remove("is-opening");
      setTimeout(() => opener.remove(), 1000);
    }, Math.max(0, MIN - (performance.now() - started)));
    if (document.readyState === "complete") finish(); else addEventListener("load", finish, { once: true });
    setTimeout(() => document.body.classList.remove("is-opening"), 5000); // never trap scrolling
  } else document.body.classList.remove("is-opening");

  /* ---------- gentle scroll reveal ---------- */
  const revealEls = [...document.querySelectorAll("[data-reveal]")];
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
    revealEls.forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; io.observe(el); });
  }

  /* ---------- 3D storybook in the hero ---------- */
  const hero = document.querySelector(".hero");
  const stage = document.getElementById("heroVisual");
  const pos = document.getElementById("bookPos");
  const book = document.getElementById("book");
  const cover = document.getElementById("cover");
  const leaf1 = document.getElementById("leaf1");
  const leaf2 = document.getElementById("leaf2");
  if (hero && stage && pos && book && cover && leaf1 && leaf2) {
    const cur = { open: 0, flip: 0, rx: 6, ry: -24, rz: -3 };
    let mx = 0, my = 0, visible = true;
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
    const bt = parseFloat(getComputedStyle(book).getPropertyValue("--bt")) || 14;
    const renderBook = () => {
      requestAnimationFrame(renderBook);
      if (!visible) return;
      const p = clamp(scrollY / Math.max(1, hero.offsetHeight * .75));
      const open = ease(clamp((p - .1) / .55));
      const t = { open, flip: clamp((p - .4) / .5) * 2, rx: lerp(6, 14, open), ry: lerp(-24, -6, open), rz: lerp(-3, 0, open) };
      const k = reduce ? 1 : .1;
      for (const key in t) cur[key] = lerp(cur[key], t[key], k);
      const wob = reduce ? 0 : Math.sin(performance.now() / 1400) * 1.6;
      const bw = book.offsetWidth, bh = book.offsetHeight;
      const W = stage.clientWidth, H = stage.clientHeight;
      const closedS = Math.min(H * .84 / bh, W * .74 / bw);
      const openS = Math.min(H * .78 / bh, W * .96 / (2 * bw));
      const sc = lerp(closedS, openS, cur.open);
      pos.style.transform = `translate3d(0, ${(wob * 4).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
      book.style.transform = `translateX(${(cur.open * bw * .5).toFixed(1)}px) rotateX(${cur.rx + my * -8}deg) rotateY(${cur.ry + mx * 14 + wob}deg) rotateZ(${cur.rz}deg)`;
      cover.style.transform = `translateZ(${bt / 2}px) rotateY(${-cur.open * 178}deg)`;
      const f1 = clamp(cur.flip), f2 = clamp(cur.flip - 1);
      leaf1.style.transform = `translateZ(${bt / 2 - 1.2}px) rotateY(${-f1 * 175}deg)`;
      leaf2.style.transform = `translateZ(${bt / 2 - 2}px) rotateY(${-f2 * 172}deg)`;
    };
    requestAnimationFrame(renderBook);
  }

  /* ---------- portfolio: show more ---------- */
  const more = document.getElementById("showMore");
  if (more) more.addEventListener("click", () => {
    const hiddenCards = [...document.querySelectorAll(".book-card.is-more")];
    const opening = more.getAttribute("aria-expanded") !== "true";
    hiddenCards.forEach(card => { card.hidden = !opening; });
    more.setAttribute("aria-expanded", String(opening));
    more.firstChild.textContent = opening ? "Show fewer books " : (more.dataset.label || "Show more books ");
    const count = more.querySelector(".count");
    if (count) count.hidden = opening;
    if (opening && hiddenCards[0]) hiddenCards[0].querySelector("a")?.focus({ preventScroll: true });
  });
  if (more) more.dataset.label = more.firstChild.textContent;

  /* ---------- floating contact menu ---------- */
  const fabToggle = document.getElementById("fabToggle");
  const fabMenu = document.getElementById("fabMenu");
  if (fabToggle && fabMenu) {
    const setOpen = open => { fabMenu.hidden = !open; fabToggle.setAttribute("aria-expanded", String(open)); };
    fabToggle.addEventListener("click", e => { e.stopPropagation(); setOpen(fabMenu.hidden); });
    document.addEventListener("click", e => { if (!e.target.closest("#fab")) setOpen(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !fabMenu.hidden) { setOpen(false); fabToggle.focus(); } });
  }

  /* ---------- quote form -> WhatsApp ---------- */
  document.querySelectorAll("[data-pkg]").forEach(a => a.addEventListener("click", () => {
    const sel = document.getElementById("qService");
    if (sel) [...sel.options].forEach(o => { if (o.text === a.dataset.pkg) sel.value = o.value; });
  }));
  const form = document.getElementById("quoteForm");
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById("qError");
    if (!v("qName") || !v("qStory")) { err.hidden = false; return; }
    err.hidden = true;
    const msg = [
      `Hi ${form.dataset.greeting || "there"}, I'm ${v("qName")}.`,
      `I'd like a quote for: ${v("qService")}.`,
      v("qPages") && `Pages: ${v("qPages")}`,
      v("qSize") && `Trim size: ${v("qSize")}`,
      `About my story: ${v("qStory")}`
    ].filter(Boolean).join("\n");
    const a = document.createElement("a");
    a.href = `https://wa.me/${form.dataset.wa || ""}?text=${encodeURIComponent(msg)}`;
    a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
