(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     Opener: shows the brand while the page loads, then lifts away
     ========================================================= */
  const opener = document.getElementById("opener");
  if (opener) {
    const started = performance.now();
    const MIN = reduce ? 900 : 1700;
    const finish = () => {
      setTimeout(() => {
        opener.classList.add("done");
        document.body.classList.remove("is-opening");
        setTimeout(() => opener.remove(), 1000);
      }, Math.max(0, MIN - (performance.now() - started)));
    };
    if (document.readyState === "complete") finish(); else addEventListener("load", finish, { once: true });
    setTimeout(() => document.body.classList.remove("is-opening"), 5000); // never trap scrolling
  } else document.body.classList.remove("is-opening");

  /* =========================================================
     Gold dust in the background
     ========================================================= */
  const sky = document.getElementById("sky");
  const sx = sky.getContext("2d");
  let stars = [];
  function sizeSky() {
    const d = Math.min(devicePixelRatio || 1, 2);
    sky.width = innerWidth * d; sky.height = innerHeight * d;
    stars = Array.from({ length: Math.round(innerWidth * innerHeight / 14000) }, () => ({
      x: Math.random() * sky.width, y: Math.random() * sky.height,
      r: (Math.random() * 1.2 + .3) * d, p: Math.random() * 6.28, s: Math.random() * .02 + .004
    }));
  }
  function drawSky() {
    sx.clearRect(0, 0, sky.width, sky.height);
    sx.fillStyle = "#c8a24a";
    for (const s of stars) {
      s.p += s.s;
      sx.globalAlpha = .12 + (Math.sin(s.p) + 1) * .2;
      sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.283); sx.fill();
    }
    if (!reduce) requestAnimationFrame(drawSky);
  }
  sizeSky(); drawSky();
  addEventListener("resize", sizeSky);

  /* =========================================================
     The 3D storybook (opening screen only)
     It turns with the mouse and opens as you scroll past the opening screen.
     ========================================================= */
  const hero = document.querySelector(".hero");
  const stage = document.getElementById("heroVisual");
  const pos = document.getElementById("bookPos");
  const book = document.getElementById("book");
  const cover = document.getElementById("cover");
  const leaf1 = document.getElementById("leaf1");
  const leaf2 = document.getElementById("leaf2");
  if (hero && stage && pos && book) {
    const cur = { open: 0, flip: 0, rx: 6, ry: -24, rz: -3 };
    let mx = 0, my = 0, visible = true;
    addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);

    const renderBook = () => {
      requestAnimationFrame(renderBook);
      if (!visible) return;
      const p = clamp(scrollY / Math.max(1, hero.offsetHeight * .75));
      const open = ease(clamp((p - .1) / .55));
      const t = {
        open,
        flip: clamp((p - .4) / .5) * 2,
        rx: lerp(6, 14, open),
        ry: lerp(-24, -6, open),
        rz: lerp(-3, 0, open)
      };
      const k = reduce ? 1 : .1;
      for (const key in t) cur[key] = lerp(cur[key], t[key], k);
      const wob = reduce ? 0 : Math.sin(performance.now() / 1400) * 1.6;
      const bw = book.offsetWidth, bh = book.offsetHeight;
      const W = stage.clientWidth, H = stage.clientHeight;
      const closedS = Math.min(H * .86 / bh, W * .78 / bw);
      const openS = Math.min(H * .8 / bh, W * .96 / (2 * bw));
      const sc = lerp(closedS, openS, cur.open);
      pos.style.transform = `translate3d(0, ${(wob * 4).toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
      book.style.transform =
        `translateX(${(cur.open * bw * .5).toFixed(1)}px) rotateX(${cur.rx + my * -8}deg) rotateY(${cur.ry + mx * 14 + wob}deg) rotateZ(${cur.rz}deg)`;
      const bt = parseFloat(getComputedStyle(book).getPropertyValue("--bt")) || 14;
      cover.style.transform = `translateZ(${bt / 2}px) rotateY(${-cur.open * 178}deg)`;
      const f1 = clamp(cur.flip), f2 = clamp(cur.flip - 1);
      leaf1.style.transform = `translateZ(${bt / 2 - 1.2}px) rotateY(${-f1 * 175}deg)`;
      leaf2.style.transform = `translateZ(${bt / 2 - 2}px) rotateY(${-f2 * 172}deg)`;
    };
    requestAnimationFrame(renderBook);
  }

  /* =========================================================
     Case-study filter (cards are built into the page)
     ========================================================= */
  const grid = document.getElementById("caseGrid");
  document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    const f = btn.dataset.filter;
    if (grid) grid.querySelectorAll(".case").forEach(card => { card.hidden = !(f === "all" || card.dataset.cat === f); });
  }));

  /* =========================================================
     Quote form -> WhatsApp
     ========================================================= */
  document.querySelectorAll("[data-pkg]").forEach(a => a.addEventListener("click", () => {
    const sel = document.getElementById("qService");
    [...sel.options].forEach(o => { if (o.text === a.dataset.pkg) sel.value = o.value; });
  }));
  const form = document.getElementById("quoteForm");
  const WA = (form && form.dataset.wa) || "";
  const greet = (form && form.dataset.greeting) || "there";
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById("qError");
    if (!v("qName") || !v("qStory")) { err.hidden = false; return; }
    err.hidden = true;
    const msg = [
      `Hi ${greet}, I'm ${v("qName")}.`,
      `I'd like a quote for: ${v("qService")}.`,
      v("qPages") && `Pages: ${v("qPages")}`,
      v("qSize") && `Trim size: ${v("qSize")}`,
      `About my story: ${v("qStory")}`
    ].filter(Boolean).join("\n");
    const url = `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener";
    document.body.appendChild(a); a.click(); a.remove();
  });
})();
