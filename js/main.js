(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t * t * (3 - 2 * t);
  const WA = "2349067759138";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* =========================================================
     Night sky
     ========================================================= */
  const sky = document.getElementById("sky");
  const sx = sky.getContext("2d");
  let stars = [];
  function sizeSky() {
    const d = Math.min(devicePixelRatio || 1, 2);
    sky.width = innerWidth * d; sky.height = innerHeight * d;
    stars = Array.from({ length: Math.round(innerWidth * innerHeight / 7000) }, () => ({
      x: Math.random() * sky.width, y: Math.random() * sky.height,
      r: (Math.random() * 1.3 + .3) * d, p: Math.random() * 6.28, s: Math.random() * .025 + .004,
      g: Math.random() < .12
    }));
  }
  function drawSky() {
    sx.clearRect(0, 0, sky.width, sky.height);
    for (const s of stars) {
      s.p += s.s;
      sx.globalAlpha = .25 + (Math.sin(s.p) + 1) * .3;
      sx.fillStyle = s.g ? "#f5b83a" : "#a985f5";
      sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.283); sx.fill();
    }
    if (!reduce) requestAnimationFrame(drawSky);
  }
  sizeSky(); drawSky();
  addEventListener("resize", sizeSky);

  /* =========================================================
     The scroll-reactive storybook
     ========================================================= */
  const layer = document.getElementById("bookLayer");
  const pos = document.getElementById("bookPos");
  const book = document.getElementById("book");
  const cover = document.getElementById("cover");
  const leaf1 = document.getElementById("leaf1");
  const leaf2 = document.getElementById("leaf2");
  const sections = [...document.querySelectorAll("[data-pose]")];
  const mq = matchMedia("(max-width: 900px)");

  // The book is the page's background, like the scrolling portrait in the reference video.
  // x/y: offset from screen centre in vw/vh. s: size multiplier on "fills the screen".
  // open 0..1; flip 0..2 leaves turned; dim 0..1 darkens it behind busy sections.
  const POSES = {
    hero:  { x: 20,  y: 0,  s: 1,    rx: 6,   ry: -24, rz: -3, open: 0, flip: 0, o: 1, dim: .05 },
    tilt:  { x: 22,  y: 2,  s: .95,  rx: -6,  ry: 32,  rz: 5,  open: 0, flip: 0, o: 1, dim: .2 },
    open:  { x: 22,  y: 0,  s: .95,  rx: 12,  ry: -4,  rz: 0,  open: 1, flip: 0, o: 1, dim: .15, flipRange: true },
    hide:  { x: 0,   y: 0,  s: 1.05, rx: 10,  ry: -38, rz: -4, open: 0, flip: 0, o: 1, dim: .85 },
    spine: { x: 20,  y: 0,  s: 1,    rx: 4,   ry: 68,  rz: -6, open: 0, flip: 0, o: 1, dim: .2 },
    back:  { x: 0,   y: 0,  s: 1.05, rx: 6,   ry: -160,rz: 4,  open: 0, flip: 0, o: 1, dim: .8 },
    final: { x: 22,  y: 0,  s: .95,  rx: 12,  ry: -6,  rz: 0,  open: 1, flip: 2, o: 1, dim: .12 }
  };
  const KEYS = ["x", "y", "s", "rx", "ry", "rz", "open", "flip", "o", "dim"];
  const dimEl = document.getElementById("bookDim");
  const cur = { ...POSES.hero };
  let mx = 0, my = 0;
  addEventListener("pointermove", e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  function poseFor(name, p) {
    const base = POSES[name];
    const out = { ...base };
    if (base.flipRange) out.flip = clamp((p - .25) / .5) * 2;
    if (mq.matches) {
      // phone: the book sits centred behind the text, a little darker so words stay readable
      out.x = 0;
      out.dim = Math.max(out.dim, name === "hero" ? .62 : .7);
      out.y = name === "hero" ? -8 : 0;
    }
    return out;
  }

  function targetPose() {
    const mid = innerHeight * .5;
    let idx = 0, prog = 0;
    for (let i = 0; i < sections.length; i++) {
      const r = sections[i].getBoundingClientRect();
      if (r.top <= mid) { idx = i; prog = clamp((mid - r.top) / r.height); }
    }
    const a = poseFor(sections[idx].dataset.pose, prog);
    const next = sections[idx + 1];
    if (!next) return a;
    const b = poseFor(next.dataset.pose, 0);
    const t = ease(clamp((prog - .72) / .28));
    const out = {};
    for (const k of KEYS) out[k] = lerp(a[k], b[k], t);
    return out;
  }

  function renderBook() {
    const t = targetPose();
    const k = reduce ? 1 : .085;
    for (const key of KEYS) cur[key] = lerp(cur[key], t[key], k);
    const wob = reduce ? 0 : Math.sin(performance.now() / 1400) * 1.6;
    const bw = book.offsetWidth, bh = book.offsetHeight;
    // closed: the book stands ~84% of the screen tall; open: the spread fits the width
    const closedS = Math.min(innerHeight * .84 / bh, innerWidth * (mq.matches ? .8 : .5) / bw);
    const openS = Math.min(innerHeight * .72 / bh, innerWidth * (mq.matches ? .9 : .5) / (2 * bw));
    const sc = lerp(closedS, openS, cur.open) * cur.s;
    // keep an open spread on screen even when the pose pushes it sideways
    const maxX = Math.max(0, 50 - (bw * sc * (1 + cur.open)) / innerWidth * 50);
    const x = clamp(cur.x, -maxX, maxX);
    pos.style.opacity = cur.o.toFixed(3);
    pos.style.transform =
      `translate3d(${x.toFixed(2)}vw, calc(${cur.y}vh + ${wob * 4}px), 0) scale(${sc.toFixed(3)})`;
    dimEl.style.opacity = cur.dim.toFixed(3);
    // when open, slide right by half a page so the spread stays centred
    book.style.transform =
      `translateX(${(cur.open * bw * .5).toFixed(1)}px) rotateX(${cur.rx + my * -8}deg) rotateY(${cur.ry + mx * 14 + wob}deg) rotateZ(${cur.rz}deg)`;
    const bt = parseFloat(getComputedStyle(book).getPropertyValue("--bt")) || 14;
    cover.style.transform = `translateZ(${bt / 2}px) rotateY(${-cur.open * 178}deg)`;
    const f1 = clamp(cur.flip), f2 = clamp(cur.flip - 1);
    leaf1.style.transform = `translateZ(${bt / 2 - 1.2}px) rotateY(${-f1 * 175}deg)`;
    leaf2.style.transform = `translateZ(${bt / 2 - 2}px) rotateY(${-f2 * 172}deg)`;
    requestAnimationFrame(renderBook);
  }
  requestAnimationFrame(renderBook);

  /* =========================================================
     Case-study showcase: 3D ring  <->  sideways glide
     ========================================================= */
  const CASES = [
    { slug: "christmas-star", img: "img/books/christmas-star-wrap.jpg", title: "The Little Girl Who Found the Christmas Star", genre: "Children's picture book", cat: "children", did: "Illustration · Cover design", pdf: null },
    { slug: "soul-sneakers", title: "Soul Sneakers: Passport to Play", genre: "Children's book", cat: "children" },
    { slug: "my-seven-covenants", title: "My Seven Covenants", genre: "Illustrated faith book", cat: "children" },
    { slug: "structure-creates-freedom", title: "Structure Creates Freedom", genre: "Juvenile nonfiction", cat: "children",
      pdf: "https://cmsfvqcphouhwqfxfrhd.supabase.co/storage/v1/object/public/cms-images/portfolio/1794611170529_Structure_Creates_Freedom_Case_Study.pdf" },
    { slug: "cursed-codex", img: "img/books/cursed-codex-wrap.jpg", title: "The Cursed Codex", genre: "Dark fantasy novel", cat: "fiction", did: "Cover design", pdf: null },
    { slug: "judge-not", title: "Judge Not", genre: "Christian nonfiction", cat: "faith" },
    { slug: "foundations", title: "Foundations", genre: "Christian living", cat: "faith" },
    { slug: "gen-b-generation-blessed", title: "Gen B: Generation Blessed", genre: "Memoir-style story", cat: "nonfiction" },
    { slug: "come-forth", title: "Come Forth", genre: "Epic fantasy fiction", cat: "fiction" },
    { slug: "own-your-shit-workbook", title: "Own Your Sh!t Workbook", genre: "Therapy workbook", cat: "workbook" },
    { slug: "from-anxious-to-confident", title: "From Anxious to Confident", genre: "Self-help workbook", cat: "workbook" },
    { slug: "gig-search-hacks", title: "Gig Search Hacks Workbook", genre: "Workbook", cat: "workbook" },
    { slug: "senior-living-made-simple", title: "Senior Living Made SIMPLE Workbook", genre: "Guided workbook", cat: "workbook" },
    { slug: "the-relationship-detox", title: "The Relationship Detox", genre: "Healing workbook", cat: "workbook" },
    { slug: "moving-to-spain", title: "Moving to Spain With Children", genre: "Relocation guide", cat: "nonfiction" },
    { slug: "therapy-changed", title: "Therapy Changed My Suicidal Thoughts to Self-Love!", genre: "Memoir", cat: "nonfiction" },
    { slug: "from-flagged-to-restored", title: "From Flagged to Restored", genre: "Nonfiction / KDP", cat: "nonfiction" },
    { slug: "stronger-at-the-core", title: "Stronger at the Core", genre: "Leadership training", cat: "nonfiction" },
    { slug: "gotta-get-it-out", title: "Gotta Get It Out", genre: "Poetry", cat: "fiction" },
    { slug: "left-on-read", title: "Left on Read", genre: "Novel", cat: "fiction",
      pdf: "https://cmsfvqcphouhwqfxfrhd.supabase.co/storage/v1/object/public/cms-images/portfolio/1793801440429_Left_on_Read_Case_Study.pdf" }
  ].map(c => ({
    ...c,
    img: c.img || `img/cases/${c.slug}.jpg`,
    did: c.did || "Book design case study",
    pdf: c.pdf === undefined ? `https://seller.olamilekanwaliu.com/samples/${c.slug}-case-study.pdf` : c.pdf
  }));

  const stage = document.getElementById("showStage");
  const ringTilt = document.querySelector(".ring-tilt");
  const ring = document.getElementById("ring");
  const pGenre = document.getElementById("pGenre"), pTitle = document.getElementById("pTitle"), pDid = document.getElementById("pDid"), pPdf = document.getElementById("pPdf");
  const ringBtn = document.getElementById("ringBtn");

  const cards = CASES.map((c, i) => {
    const el = document.createElement("button");
    el.type = "button";
    el.className = "card";
    el.setAttribute("aria-label", `${c.title}, ${c.genre}`);
    el.innerHTML = `<div class="card-f"></div><div class="card-b"><small>${c.genre}</small><strong>${c.title}</strong><span>★</span></div>`;
    el.querySelector(".card-f").style.backgroundImage = `url("${c.img}")`;
    ring.appendChild(el);
    const st = { el, data: c, x: 0, z: -600, ry: 0, s: .6, o: 0, visible: true, vi: i };
    el.addEventListener("click", () => { if (!dragMoved) focusCard(st); });
    return st;
  });

  let mode = "ring";        // "ring" | "glide"
  let ringAngle = 0;        // degrees
  let active = 0;           // index into visible list
  let spin = 0;             // extra rotation for the centred book in glide mode
  let spinStart = 0;
  let tilt = -9;
  let dragging = null, dragMoved = false;
  let visibleList = cards.slice();

  function cardSize() { return cards[0].el.offsetWidth || 330; }

  function setPanel(c) {
    pGenre.textContent = c.genre;
    pTitle.textContent = c.title;
    pDid.textContent = c.did;
    if (c.pdf) { pPdf.hidden = false; pPdf.href = c.pdf; } else { pPdf.hidden = true; }
  }

  const norm = a => ((a % 360) + 540) % 360 - 180;
  let spinFrom = 0;
  function startSpin() {
    spinStart = performance.now();
    const st = visibleList[active];
    if (st) { st.ry = norm(st.ry); spinFrom = st.ry; }
  }

  function focusCard(st) {
    const i = visibleList.indexOf(st);
    if (i < 0) return;
    if (mode === "glide" && i === active) return;
    active = i; mode = "glide"; stage.dataset.mode = "glide";
    setPanel(st.data); startSpin();
  }
  function step(d) {
    const n = visibleList.length;
    if (mode === "ring") { active = frontIndex(); mode = "glide"; stage.dataset.mode = "glide"; }
    active = (active + d + n) % n;
    setPanel(visibleList[active].data); startSpin();
  }
  document.getElementById("prevBtn").addEventListener("click", () => step(-1));
  document.getElementById("nextBtn").addEventListener("click", () => step(1));
  ringBtn.addEventListener("click", () => {
    mode = "ring"; stage.dataset.mode = "ring";
    const n = visibleList.length;
    ringAngle = -active * (360 / n);
  });

  function frontIndex() {
    const n = visibleList.length, stepA = 360 / n;
    let best = 0, bestD = 999;
    visibleList.forEach((st, i) => {
      const a = ((i * stepA + ringAngle) % 360 + 540) % 360 - 180;
      if (Math.abs(a) < bestD) { bestD = Math.abs(a); best = i; }
    });
    return best;
  }

  // filters
  document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    const f = btn.dataset.filter;
    cards.forEach(st => { st.visible = f === "all" || st.data.cat === f; st.el.tabIndex = st.visible ? 0 : -1; st.el.toggleAttribute("hidden-card", !st.visible); });
    visibleList = cards.filter(s => s.visible);
    active = 0; ringAngle = 0;
    setPanel(visibleList[0].data);
    if (mode === "glide") startSpin();
  }));

  // drag / swipe
  stage.addEventListener("pointerdown", e => {
    if (e.target.closest(".show-arrow")) return;
    dragging = { x: e.clientX, a: ringAngle, act: active };
    dragMoved = false;
  });
  addEventListener("pointermove", e => {
    if (!dragging) return;
    const dx = e.clientX - dragging.x;
    if (Math.abs(dx) > 6) dragMoved = true;
    if (mode === "ring") ringAngle = dragging.a + dx * .18;
    else {
      const stepPx = cardSize() * .55;
      const n = visibleList.length;
      const d = Math.round(-dx / stepPx);
      const want = ((dragging.act + d) % n + n) % n;
      if (want !== active) { active = want; setPanel(visibleList[active].data); startSpin(); }
    }
  });
  addEventListener("pointerup", () => { dragging = null; setTimeout(() => { dragMoved = false; }, 0); });

  // pause auto-rotate while hovering the ring
  let hover = false;
  stage.addEventListener("pointerenter", () => { hover = true; });
  stage.addEventListener("pointerleave", () => { hover = false; });

  let inView = true;
  new IntersectionObserver(es => { inView = es[0].isIntersecting; }).observe(stage);

  function renderShow(now) {
    requestAnimationFrame(renderShow);
    if (!inView) return;
    const n = visibleList.length;
    const cw = cardSize();
    const k = reduce ? 1 : .09;

    if (mode === "ring") {
      if (!dragging && !hover && !reduce) ringAngle -= .06;
      const stepA = 360 / n;
      const r = Math.max(cw * 1.1, ((cw + 26) / 2) / Math.tan(Math.PI / Math.max(n, 3)));
      visibleList.forEach((st, i) => {
        const a = (i * stepA + ringAngle) * Math.PI / 180;
        st.tx = Math.sin(a) * r;
        st.tz = Math.cos(a) * r - r;
        st.try = i * stepA + ringAngle;
        st.ts = 1; st.to = 1; st.dim = clamp((1 - Math.cos(a)) * .35, 0, .6);
      });
      const fi = frontIndex();
      if (visibleList[fi] && pTitle.textContent !== visibleList[fi].data.title) setPanel(visibleList[fi].data);
      tilt = lerp(tilt, -9, k);
    } else {
      const sp = cw * .78;
      const elapsed = (now - spinStart) / 1100;
      spin = elapsed < 1
        ? lerp(spinFrom, 360, ease(clamp(elapsed)))
        : 360 + Math.sin((now - spinStart - 1100) / 900) * 14;
      visibleList.forEach((st, i) => {
        let d = i - active;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        const ad = Math.abs(d);
        st.tx = d * sp + Math.sign(d) * cw * .32;
        st.tz = d === 0 ? 140 : -ad * 120;
        st.try = d === 0 ? spin : d * -14;
        st.ts = d === 0 ? 1.18 : 1 - Math.min(ad, 4) * .06;
        st.to = ad > 3 ? 0 : 1;
        st.dim = d === 0 ? 0 : Math.min(.25 + ad * .12, .7);
      });
      tilt = lerp(tilt, 0, k);
    }
    cards.forEach(st => {
      if (!st.visible) { st.to = 0; st.ts = .4; st.tz = (st.tz ?? -800) - 10; }
      st.x = lerp(st.x, st.tx ?? 0, k);
      st.z = lerp(st.z, st.tz ?? -600, k);
      // rotate by shortest path
      const tr = st.try ?? 0;
      if (mode === "glide" && st === visibleList[active]) st.ry = tr;
      else st.ry += norm(tr - st.ry) * k;
      st.s = lerp(st.s, st.ts ?? 1, k);
      st.o = lerp(st.o, st.to ?? 1, k);
      st.el.style.transform = `translate3d(${st.x.toFixed(1)}px, 0, ${st.z.toFixed(1)}px) rotateY(${st.ry.toFixed(2)}deg) scale(${st.s.toFixed(3)})`;
      st.el.style.opacity = st.o.toFixed(3);
      st.el.style.setProperty("--dim", (st.dim ?? 0).toFixed(2));
      st.el.style.visibility = st.o < .02 ? "hidden" : "visible";
    });
    ringTilt.style.transform = `rotateX(${tilt.toFixed(2)}deg)`;
  }
  setPanel(CASES[0]);
  requestAnimationFrame(renderShow);

  /* =========================================================
     Quote form -> WhatsApp
     ========================================================= */
  document.querySelectorAll("[data-pkg]").forEach(a => a.addEventListener("click", () => {
    const sel = document.getElementById("qService");
    [...sel.options].forEach(o => { if (o.text === a.dataset.pkg) sel.value = o.value; });
  }));
  const form = document.getElementById("quoteForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const err = document.getElementById("qError");
    if (!v("qName") || !v("qStory")) { err.hidden = false; return; }
    err.hidden = true;
    const msg = [
      `Hi Blessed, I'm ${v("qName")}.`,
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
