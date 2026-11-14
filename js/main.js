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

  const grid = document.getElementById("caseGrid");
  const esc = s => s.replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  CASES.forEach(c => {
    const card = document.createElement("article");
    card.className = "case glass";
    card.dataset.cat = c.cat;
    const link = c.pdf
      ? `<a class="case-link" href="${c.pdf}" target="_blank" rel="noopener">View PDF <span aria-hidden="true">→</span></a>`
      : `<a class="case-link" href="#quote">Start a book like this <span aria-hidden="true">→</span></a>`;
    card.innerHTML = `
      <div class="case-img"><img src="${c.img}" alt="${esc(c.title)}, ${esc(c.genre)}" loading="lazy" width="1000" height="600"></div>
      <div class="case-body">
        <p class="case-kicker">Case study</p>
        <p class="case-genre">${esc(c.genre)}</p>
        <h3>${esc(c.title)}</h3>
        ${link}
      </div>`;
    grid.appendChild(card);
  });
  document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
    const f = btn.dataset.filter;
    grid.querySelectorAll(".case").forEach(card => { card.hidden = !(f === "all" || card.dataset.cat === f); });
  }));

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
