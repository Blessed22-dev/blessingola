import { SECTIONS } from "./schema.js";
import { renderPage } from "../lib/render.mjs";

/* =====================================================================
   helpers
   ===================================================================== */
const $ = s => document.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
    else if (k === "text") el.textContent = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v === true ? "" : v);
  }
  for (const kid of kids.flat()) if (kid != null && kid !== false) el.append(kid);
  return el;
};

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17.5h.01"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  power: '<path d="M12 3v9"/><path d="M6.4 6.4a8 8 0 1 0 11.2 0"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
  external: '<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  dots: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  down: '<path d="m6 10 6 6 6-6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h14v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  google: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/><path d="M8 11h6"/>',
  pen: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  filter: '<path d="M4 5h16l-6 8v6l-4-2v-4z"/>'
};
const icon = (name, size = 18) => {
  const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size); s.setAttribute("height", size);
  s.setAttribute("fill", "none"); s.setAttribute("stroke", "currentColor"); s.setAttribute("stroke-width", "2");
  s.setAttribute("stroke-linecap", "round"); s.setAttribute("stroke-linejoin", "round"); s.setAttribute("aria-hidden", "true");
  s.innerHTML = ICONS[name] || ""; return s;
};
const fillIcons = (root = document) => root.querySelectorAll("[data-icon]").forEach(el => { if (!el.firstChild) el.append(icon(el.dataset.icon)); });

const DEMO = new URLSearchParams(location.search).has("demo");
const SITE_ROOT = new URL("../", location.href).href;
const DRAFT_KEY = "bk_admin_draft";
const TONES = ["blue", "orange", "green", "purple", "red", "grey"];
const SETTINGS_KEYS = ["contact", "brand", "nav", "seo"];

const state = { content: null, saved: "", sha: null, uploads: {}, saving: false, view: "dashboard", lastSaved: null };
let uid = 0;

function toast(msg, isErr) {
  const t = $("#toast");
  t.textContent = msg; t.className = "toast" + (isErr ? " err" : ""); t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, isErr ? 7000 : 3500);
}
function setStatus(text, kind = "") { const s = $("#status"); s.textContent = text; s.className = "save-state " + kind; }
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage off */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* storage off */ } }
};
async function api(path, opts = {}) {
  const r = await fetch(path, { credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...opts, body: opts.body ? JSON.stringify(opts.body) : undefined });
  let data = {};
  try { data = await r.json(); } catch { /* no body */ }
  if (!r.ok) throw Object.assign(new Error(data.error || `Request failed (${r.status})`), { status: r.status });
  return data;
}
const isDirty = () => state.content && JSON.stringify(state.content) !== state.saved;
const imgSrc = p => {
  if (!p) return "";
  if (state.uploads[p]) return state.uploads[p];
  if (/^https?:|^data:|^blob:/i.test(p)) return p;
  return SITE_ROOT + p.replace(/^\//, "");
};
const get = (obj, path) => path.reduce((o, k) => (o == null ? o : o[k]), obj);
const ensureArr = (path) => {
  let o = state.content;
  path.slice(0, -1).forEach(k => { if (!o[k] || typeof o[k] !== "object") o[k] = {}; o = o[k]; });
  const last = path[path.length - 1];
  if (!Array.isArray(o[last])) o[last] = [];
  return o[last];
};
const sectionDef = key => SECTIONS.find(s => s.key === key);
const fieldDef = (sectionKey, fieldKey) => (sectionDef(sectionKey).fields || []).find(f => f.key === fieldKey);
const clip = (s, n = 80) => { s = String(s || ""); return s.length > n ? s.slice(0, n - 1) + "…" : s; };

/* =====================================================================
   login
   ===================================================================== */
async function boot() {
  fillIcons();
  if (DEMO) return startApp();
  try { const s = await api("/api/login"); if (s.loggedIn) return startApp(); } catch { /* show login */ }
  showLogin();
}
function showLogin(msg) {
  $("#appView").hidden = true; $("#loginView").hidden = false;
  const err = $("#lError"); err.hidden = !msg; err.textContent = msg || "";
  $("#lUser").focus();
}
$("#lEye").addEventListener("click", () => {
  const p = $("#lPass"); const show = p.type === "password";
  p.type = show ? "text" : "password"; $("#lEye").textContent = show ? "Hide" : "Show";
  $("#lEye").setAttribute("aria-label", show ? "Hide password" : "Show password");
});
$("#loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("#lBtn"), err = $("#lError");
  btn.disabled = true; btn.textContent = "Checking…"; err.hidden = true;
  try {
    await api("/api/login", { method: "POST", body: { username: $("#lUser").value, password: $("#lPass").value } });
    $("#lPass").value = "";
    await startApp();
  } catch (ex) {
    err.textContent = ex.status === 404 ? "The admin login isn't set up on this website yet." : ex.message;
    err.hidden = false;
  } finally { btn.disabled = false; btn.textContent = "Log in"; }
});

/* =====================================================================
   app start
   ===================================================================== */
async function startApp() {
  $("#loginView").hidden = true; $("#appView").hidden = false;
  setStatus("Loading…");
  try {
    if (DEMO) {
      const r = await fetch(SITE_ROOT + "content/content.json", { cache: "no-store" });
      state.content = await r.json(); state.sha = null;
    } else {
      const d = await api("/api/content");
      state.content = d.content; state.sha = d.sha;
    }
  } catch (ex) {
    if (ex.status === 401) return showLogin("Your session ended. Please log in again.");
    setStatus("Couldn't load content", "err"); toast(ex.message, true); return;
  }
  state.saved = JSON.stringify(state.content);
  buildRail();
  go(location.hash.slice(1) || "dashboard");
  refreshChrome();
  setStatus(DEMO ? "Demo mode" : "All saved", DEMO ? "" : "ok");
  checkDraft();
}
addEventListener("hashchange", () => { if (state.content) go(location.hash.slice(1) || "dashboard", true); });

function checkDraft() {
  const raw = store.get(DRAFT_KEY);
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    if (d && d.content && JSON.stringify(d.content) !== state.saved) {
      $("#draftBanner").hidden = false;
      $("#draftRestore").onclick = () => { state.content = d.content; $("#draftBanner").hidden = true; changed(); go(state.view, true); toast("Your unsaved changes are back. Press Save & publish when ready."); };
      $("#draftDrop").onclick = () => { store.del(DRAFT_KEY); $("#draftBanner").hidden = true; };
    } else store.del(DRAFT_KEY);
  } catch { store.del(DRAFT_KEY); }
}

/* =====================================================================
   navigation
   ===================================================================== */
const COLLECTIONS = {
  work: {
    path: ["work", "items"], section: "work", field: "items", title: "Case studies", single: "case study", icon: "grid",
    intro: "Your portfolio grid on the website. Click a row to edit it.",
    search: it => `${it.title} ${it.genre}`,
    filter: { label: "All filter groups", options: () => (state.content.work?.categories || []).map(c => [c.id, c.label]), test: (it, v) => it.category === v },
    tiles: items => {
      const cats = state.content.work?.categories || [];
      return cats.slice(0, 4).map((c, i) => ({ label: c.label, value: items.filter(it => it.category === c.id).length, note: "case studies", tone: TONES[i], filter: c.id }));
    },
    columns: [
      { label: "Picture", cell: it => h("img", { class: "row-thumb", alt: "", src: imgSrc(it.image) || null, loading: "lazy" }) },
      { label: "Book title", cell: it => h("span", { class: "strong", text: it.title || "(untitled)" }) },
      { label: "Book type", cell: it => it.genre || "—" },
      { label: "Filter group", cell: it => { const cats = state.content.work?.categories || []; const i = cats.findIndex(c => c.id === it.category); return chip(i > -1 ? cats[i].label : (it.category || "none"), i > -1 ? TONES[i % 4] : "red"); } },
      { label: "Link", cell: it => it.link ? chip(/\.pdf($|\?)/i.test(it.link) ? "PDF" : "Link", "green") : chip("Quote form", "grey") }
    ]
  },
  reviews: {
    path: ["reviews", "items"], section: "reviews", field: "items", title: "Reviews", single: "review", icon: "star",
    intro: "The sliding client reviews. The featured Fiverr review is edited under Page sections → Reviews.",
    search: it => `${it.name} ${it.role} ${it.text}`,
    tiles: items => {
      const avg = items.length ? (items.reduce((s, r) => s + (Number(r.stars) || 0), 0) / items.length) : 0;
      const f = state.content.reviews?.featured;
      return [
        { label: "Sliding reviews", value: items.length, note: "on the page", tone: "blue" },
        { label: "Average rating", value: avg ? avg.toFixed(1) + " ★" : "—", note: "from these reviews", tone: "orange" },
        { label: "5-star reviews", value: items.filter(r => Number(r.stars) >= 5).length, note: "reviews", tone: "green" },
        { label: "Featured review", value: f && f.show !== false ? "Shown" : "Hidden", note: "big Fiverr card", tone: "purple", go: "section/reviews" }
      ];
    },
    columns: [
      { label: "Client", cell: it => h("span", {}, h("span", { class: "mini-av", style: `background:${/^#[0-9a-f]{3,8}$/i.test(it.color || "") ? it.color : "#9b74ee"}`, text: (it.name || "?").charAt(0).toUpperCase() }), h("span", { class: "strong", text: it.name || "(no name)" })) },
      { label: "Who they are", cell: it => it.role || "—" },
      { label: "Review", cell: it => h("div", { class: "trunc", text: it.text || "" }) },
      { label: "Stars", cell: it => chip("★ " + (it.stars || "5"), Number(it.stars) >= 5 ? "green" : Number(it.stars) >= 4 ? "blue" : "orange") }
    ]
  },
  faq: {
    path: ["faq", "items"], section: "faq", field: "items", title: "FAQ", single: "question", icon: "help",
    intro: "Questions and answers. These also appear on Google as FAQ results.",
    search: it => `${it.question} ${it.answer}`,
    tiles: items => [
      { label: "Questions", value: items.length, note: "on the page", tone: "blue" },
      { label: "Answered", value: items.filter(f => (f.answer || "").trim()).length, note: "with an answer", tone: "green" },
      { label: "Missing answers", value: items.filter(f => !(f.answer || "").trim()).length, note: "need writing", tone: "orange" },
      { label: "Short answers", value: items.filter(f => (f.answer || "").trim() && f.answer.length < 60).length, note: "under 60 letters", tone: "purple" }
    ],
    columns: [
      { label: "Question", cell: it => h("div", { class: "strong trunc", text: it.question || "(empty)" }) },
      { label: "Answer", cell: it => h("div", { class: "trunc", text: it.answer || "" }) },
      { label: "Status", cell: it => (it.answer || "").trim() ? chip("Answered", "green") : chip("No answer", "orange") }
    ]
  },
  packages: {
    path: ["packages", "items"], section: "packages", field: "items", title: "Packages", single: "package", icon: "tag",
    intro: "Your package cards. Add a price to show it, or leave it empty for \"Get a quote\".",
    search: it => `${it.name} ${it.for} ${(it.features || []).join(" ")}`,
    tiles: items => [
      { label: "Packages", value: items.length, note: "on the page", tone: "blue" },
      { label: "Highlighted", value: items.filter(p => p.highlight).length, note: "stand out", tone: "purple" },
      { label: "With price", value: items.filter(p => (p.price || "").trim()).length, note: "show a price", tone: "green" },
      { label: "Quote only", value: items.filter(p => !(p.price || "").trim()).length, note: "no price shown", tone: "orange" }
    ],
    columns: [
      { label: "Package", cell: it => h("span", { class: "strong", text: it.name || "(untitled)" }) },
      { label: "Price", cell: it => it.price || "Quote" },
      { label: "Included", cell: it => `${(it.features || []).length} items` },
      { label: "Badge", cell: it => it.badge ? chip(it.badge, "purple") : "—" },
      { label: "Style", cell: it => it.highlight ? chip("Highlighted", "blue") : chip("Normal", "grey") }
    ]
  }
};

const RAIL = [
  { id: "dashboard", label: "Dashboard", icon: "home" },
  { id: "list/work", label: "Case studies", icon: "grid" },
  { id: "list/reviews", label: "Reviews", icon: "star" },
  { id: "list/faq", label: "FAQ", icon: "help" },
  { id: "list/packages", label: "Packages", icon: "tag" },
  { id: "sections", label: "Page sections", icon: "layers" },
  { id: "settings", label: "Settings", icon: "settings" }
];

function buildRail() {
  const rail = $("#rail"); rail.innerHTML = "";
  rail.append(h("div", { class: "rail-logo", "aria-hidden": "true", text: "★" }));
  for (const r of RAIL) {
    rail.append(h("button", { class: "rail-btn", type: "button", "data-id": r.id, "aria-label": r.label, onclick: () => go(r.id) }, icon(r.icon, 20), h("span", { class: "tip", text: r.label })));
  }
  rail.append(h("div", { class: "rail-spacer" }));
  rail.append(h("button", { class: "rail-btn", type: "button", "aria-label": "Log out", id: "logoutBtn", onclick: logout }, icon("power", 20), h("span", { class: "tip", text: "Log out" })));
}

function go(id, fromHash) {
  const [kind, key] = id.split("/");
  state.view = id;
  if (!fromHash && location.hash.slice(1) !== id) history.pushState(null, "", "#" + id);
  const railId = kind === "section" ? (SETTINGS_KEYS.includes(key) ? "settings" : (COLLECTIONS[key] ? "list/" + key : "sections")) : id;
  document.querySelectorAll(".rail-btn[data-id]").forEach(b => b.setAttribute("aria-current", String(b.dataset.id === railId)));
  closeDrawer(true);
  const v = $("#view"); v.innerHTML = "";
  if (kind === "list" && COLLECTIONS[key]) viewList(v, key);
  else if (kind === "sections") viewSectionGrid(v, false);
  else if (kind === "settings") viewSectionGrid(v, true);
  else if (kind === "section" && sectionDef(key)) viewSection(v, key);
  else viewDashboard(v);
  v.scrollTop = 0; window.scrollTo(0, 0);
}

async function logout() {
  const b = $("#logoutBtn");
  if (isDirty() && b.dataset.armed !== "1") {
    b.dataset.armed = "1"; toast("You have unsaved changes. Click log out again to leave without saving.", true);
    setTimeout(() => { b.dataset.armed = ""; }, 4000); return;
  }
  try { await api("/api/login", { method: "DELETE" }); } catch { /* ignore */ }
  store.del(DRAFT_KEY);
  location.hash = ""; location.reload();
}

/* =====================================================================
   shared bits
   ===================================================================== */
const chip = (text, tone) => h("span", { class: `chip tone-${tone}`, text });
function pageHead(title, sub, crumbs, actions) {
  return h("div", { class: "page-head" },
    h("div", {}, crumbs ? h("div", { class: "crumbs" }, ...crumbs) : null, h("h1", { text: title }), sub ? h("p", { text: sub }) : null),
    actions ? h("div", { class: "head-actions" }, ...actions) : null);
}
const previewBtn = () => h("button", { class: "btn btn-soft", type: "button", onclick: openPreviewModal }, icon("eye", 16), "Preview");

function sectionChanged(key) {
  try { return JSON.stringify(state.content[key]) !== JSON.stringify(JSON.parse(state.saved)[key]); } catch { return false; }
}

/* =====================================================================
   dashboard
   ===================================================================== */
function viewDashboard(v) {
  const c = state.content;
  const name = c.brand?.first || "there";
  const work = c.work?.items || [], revs = c.reviews?.items || [], faqs = c.faq?.items || [], pk = c.packages?.items || [];
  const cats = c.work?.categories || [];

  v.append(h("div", { class: "page-head" },
    h("div", {}, h("h1", { text: `Hello, ${name}! 👋` }), h("p", { text: "Here's an overview of your website content today." })),
    h("div", { class: "head-actions" }, previewBtn(),
      h("button", { class: "btn btn-primary", type: "button", onclick: () => { go("list/work"); setTimeout(() => addItem("work"), 50); } }, "New case study", icon("plus", 16)))));

  const bars = (vals) => { const m = Math.max(1, ...vals); return h("div", { class: "k-bars", "aria-hidden": "true" }, ...vals.map(x => h("i", { style: `height:${Math.max(8, (x / m) * 100)}%` }))); };
  const kpi = (cls, label, num, sub, ico, vals, to) => h("button", { class: "kpi " + cls, type: "button", onclick: () => go(to) },
    h("span", { class: "k-label", text: label }), h("span", { class: "k-num", text: String(num) }), h("span", { class: "k-sub", text: sub }),
    h("span", { class: "k-ico" }, icon(ico, 18)), bars(vals));
  v.append(h("div", { class: "kpis" },
    kpi("hot", "Case studies", work.length, `${cats.length} filter groups`, "grid", cats.map(k => work.filter(w => w.category === k.id).length), "list/work"),
    kpi("", "Reviews", revs.length, revs.length ? `${(revs.reduce((s, r) => s + (Number(r.stars) || 0), 0) / revs.length).toFixed(1)} ★ average` : "No reviews yet", "star", revs.map(r => Number(r.stars) || 0), "list/reviews"),
    kpi("t-green", "FAQ questions", faqs.length, `${faqs.filter(f => (f.answer || "").trim()).length} answered`, "help", faqs.map(f => (f.answer || "").length), "list/faq"),
    kpi("t-orange", "Packages", pk.length, `${pk.filter(p => p.highlight).length} highlighted`, "tag", pk.map(p => (p.features || []).length), "list/packages")));

  // bar chart: case studies per filter group
  const barCard = h("div", { class: "card" }, h("div", { class: "card-title" }, h("h2", { text: "Case studies by filter group" }), h("span", { class: "chip-select", text: "All books" })));
  barCard.append(barChart(cats.map(k => ({ label: k.label, value: work.filter(w => w.category === k.id).length }))));
  // donut: content mix
  const mix = [
    { label: "Case studies", value: work.length, color: "#4a50f0" },
    { label: "Reviews", value: revs.length, color: "#8fa8ff" },
    { label: "FAQ questions", value: faqs.length, color: "#f59a3c" },
    { label: "Packages", value: pk.length, color: "#5fcf9d" }
  ];
  const total = mix.reduce((s, m) => s + m.value, 0) || 1;
  const donutCard = h("div", { class: "card" }, h("div", { class: "card-title" }, h("h2", { text: "Content on your page" })),
    h("div", { class: "donut-wrap" }, donut(mix),
      h("ul", { class: "legend" }, ...mix.map(m => h("li", {}, h("i", { style: `background:${m.color}` }), h("span", { text: m.label }), h("b", { text: Math.round(m.value / total * 100) + " %" }))))));
  v.append(h("div", { class: "charts" }, barCard, donutCard));

  const changedSecs = SECTIONS.filter(s => sectionChanged(s.key));
  const titleLen = (c.seo?.title || "").length;
  const stat = (bg, ico, label, val, note, onclick) => h("button", { class: "card stat", type: "button", style: "text-align:left;cursor:pointer", onclick },
    h("span", { class: "s-ico", style: `background:${bg}` }, icon(ico, 20)),
    h("span", {}, h("div", { class: "s-label", text: label }), h("div", { class: "s-val", text: val }), h("div", { class: "s-note", text: note })));
  v.append(h("div", { class: "stats" },
    stat("#6e8cff", "pen", "Unsaved changes", String(changedSecs.length), changedSecs.length ? changedSecs.map(s => s.label).slice(0, 3).join(", ") : "Everything is published", () => $("#bellBtn").click()),
    stat("#4cc38a", "google", "Google title length", `${titleLen} / 60`, titleLen > 60 ? "A bit long: Google may cut it" : titleLen ? "Good length" : "Add a title", () => go("section/seo")),
    stat("#f5b83a", "clock", "Last published", state.lastSaved ? state.lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—", state.lastSaved ? "in this visit" : "Not in this visit yet", () => {})));
}

function barChart(data) {
  const W = 560, H = 230, padL = 34, padB = 34, padT = 10;
  const max = Math.max(1, ...data.map(d => d.value));
  const step = Math.max(1, Math.ceil(max / 4));
  const top = step * 4;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("class", "bar-chart"); svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", data.map(d => `${d.label}: ${d.value}`).join(", "));
  let out = "";
  for (let i = 0; i <= 4; i++) {
    const y = padT + (H - padT - padB) * (1 - i / 4);
    out += `<line class="grid" x1="${padL}" x2="${W}" y1="${y}" y2="${y}"/><text x="${padL - 8}" y="${y + 4}" text-anchor="end">${step * i}</text>`;
  }
  const n = Math.max(1, data.length), slot = (W - padL) / n, bw = Math.min(30, slot * .42);
  data.forEach((d, i) => {
    const x = padL + slot * i + slot / 2;
    const bh = (H - padT - padB) * (d.value / top);
    const y = H - padB - bh;
    out += `<rect x="${x - bw / 2}" y="${y}" width="${bw}" height="${Math.max(0, bh)}" rx="6" fill="url(#bg)"/>`;
    const lbl = String(d.label).replace(/[&<>"]/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
    out += `<text x="${x}" y="${H - 12}" text-anchor="middle">${lbl}</text>`;
  });
  svg.innerHTML = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a60ff"/><stop offset="1" stop-color="#3f45e6"/></linearGradient></defs>` + out;
  return svg;
}
function donut(parts) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 60, C = 2 * Math.PI * r;
  let off = 0, segs = "";
  for (const p of parts) {
    const len = C * p.value / total;
    segs += `<circle cx="85" cy="85" r="${r}" fill="none" stroke="${p.color}" stroke-width="30" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}" transform="rotate(-90 85 85)"/>`;
    off += len;
  }
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 170 170"); svg.setAttribute("width", "170"); svg.setAttribute("height", "170"); svg.setAttribute("role", "img");
  svg.setAttribute("aria-label", parts.map(p => `${p.label} ${p.value}`).join(", "));
  svg.innerHTML = segs + `<text x="85" y="82" text-anchor="middle" style="font:800 22px var(--font);fill:#131a4a">${total}</text><text x="85" y="102" text-anchor="middle" style="font:600 11px var(--font);fill:#7d83a3">items</text>`;
  return svg;
}

/* =====================================================================
   table views
   ===================================================================== */
const listState = {};
function viewList(v, key) {
  const col = COLLECTIONS[key];
  const ls = listState[key] || (listState[key] = { q: "", filter: "", sort: "page", page: 1 });
  const items = ensureArr(col.path);
  const PER = 8;

  v.append(pageHead(`Manage ${col.title.toLowerCase()}`, col.intro, null, [
    previewBtn(),
    h("button", { class: "btn btn-soft", type: "button", onclick: () => go("section/" + col.section) }, icon("edit", 16), "Section text"),
    h("button", { class: "btn btn-primary", type: "button", onclick: () => addItem(key) }, `New ${col.single}`, icon("plus", 16))]));

  const tilesEl = h("div", { class: "tiles" });
  for (const t of col.tiles(items)) {
    tilesEl.append(h("button", { class: `tile tone-${t.tone}`, type: "button", "aria-pressed": String(!!t.filter && ls.filter === t.filter),
      onclick: () => { if (t.go) return go(t.go); if (t.filter) { ls.filter = ls.filter === t.filter ? "" : t.filter; ls.page = 1; go(state.view, true); } } },
      h("span", { class: "t-label", text: t.label }), h("span", { class: "t-num", text: String(t.value) }), h("span", { class: "t-note", text: t.note })));
  }
  v.append(tilesEl);

  const card = h("div", { class: "card" });
  const searchIn = h("input", { type: "search", placeholder: `Search ${col.title.toLowerCase()}…`, "aria-label": `Search ${col.title}` });
  searchIn.value = ls.q;
  const tools = h("div", { class: "toolbar" }, h("div", { class: "search" }, h("span", { class: "ic" }, icon("search", 16)), searchIn));
  let filterSel;
  if (col.filter) {
    filterSel = h("select", { "aria-label": "Filter" }, h("option", { value: "", text: col.filter.label }), ...col.filter.options().map(([v2, l]) => h("option", { value: v2, text: l })));
    filterSel.value = ls.filter;
    tools.append(filterSel);
  }
  const sortSel = h("select", { "aria-label": "Sort" }, h("option", { value: "page", text: "Page order" }), h("option", { value: "az", text: "A to Z" }), h("option", { value: "za", text: "Z to A" }));
  sortSel.value = ls.sort;
  tools.append(h("span", { class: "grow" }), sortSel);
  card.append(tools);

  const tableWrap = h("div", { class: "table-wrap" });
  const foot = h("div", { class: "table-foot" });
  card.append(tableWrap, foot);
  v.append(card);

  const draw = () => {
    let rows = items.map((it, i) => ({ it, i }));
    const q = ls.q.trim().toLowerCase();
    if (q) rows = rows.filter(r => col.search(r.it).toLowerCase().includes(q));
    if (ls.filter && col.filter) rows = rows.filter(r => col.filter.test(r.it, ls.filter));
    if (ls.sort !== "page") {
      const key2 = r => col.search(r.it).toLowerCase();
      rows.sort((a, b) => key2(a).localeCompare(key2(b)) * (ls.sort === "za" ? -1 : 1));
    }
    const pages = Math.max(1, Math.ceil(rows.length / PER));
    ls.page = Math.min(ls.page, pages);
    const slice = rows.slice((ls.page - 1) * PER, ls.page * PER);

    tableWrap.innerHTML = "";
    if (!rows.length) {
      tableWrap.append(h("div", { class: "empty" }, h("p", { text: items.length ? "Nothing matches your search." : `No ${col.title.toLowerCase()} yet.` }),
        h("button", { class: "btn btn-primary btn-sm", type: "button", onclick: () => addItem(key) }, `Add a ${col.single}`)));
    } else {
      const table = h("table", { class: "data" });
      table.append(h("thead", {}, h("tr", {}, h("th", { text: "No." }), ...col.columns.map(c2 => h("th", { text: c2.label })), h("th", { "aria-label": "Actions" }))));
      const tb = h("tbody");
      for (const { it, i } of slice) {
        const tr = h("tr", { tabindex: "0", onclick: e => { if (!e.target.closest(".row-menu")) editItem(key, i); }, onkeydown: e => { if (e.key === "Enter") editItem(key, i); } },
          h("td", { class: "num", text: String(i + 1).padStart(2, "0") }),
          ...col.columns.map(c2 => { const val = c2.cell(it); return h("td", {}, typeof val === "string" ? h("span", { text: val }) : val); }),
          h("td", {}, rowMenu(key, i, items.length, ls.sort === "page" && !q && !ls.filter)));
        tb.append(tr);
      }
      table.append(tb); tableWrap.append(table);
    }
    foot.innerHTML = "";
    const from = rows.length ? (ls.page - 1) * PER + 1 : 0, to = Math.min(rows.length, ls.page * PER);
    foot.append(h("span", { text: `${from}-${to} of ${rows.length}` }));
    const pager = h("div", { class: "pager" }, h("button", { type: "button", "aria-label": "Previous page", disabled: ls.page <= 1, onclick: () => { ls.page--; draw(); } }, icon("up", 14)));
    pager.firstChild.firstChild.style.transform = "rotate(-90deg)";
    for (let p = 1; p <= pages; p++) pager.append(h("button", { type: "button", "aria-current": String(p === ls.page), text: String(p), onclick: () => { ls.page = p; draw(); } }));
    const nx = h("button", { type: "button", "aria-label": "Next page", disabled: ls.page >= pages, onclick: () => { ls.page++; draw(); } }, icon("up", 14));
    nx.firstChild.style.transform = "rotate(90deg)";
    pager.append(nx); foot.append(pager);
  };
  searchIn.addEventListener("input", () => { ls.q = searchIn.value; ls.page = 1; draw(); });
  if (filterSel) filterSel.addEventListener("change", () => { ls.filter = filterSel.value; ls.page = 1; go(state.view, true); });
  sortSel.addEventListener("change", () => { ls.sort = sortSel.value; draw(); });
  draw();
  listState[key].redraw = draw;
}

function rowMenu(key, i, n, canMove) {
  const wrap = h("div", { class: "row-menu" });
  const btn = h("button", { class: "icon-btn", type: "button", "aria-label": "More actions", "aria-expanded": "false" }, icon("dots", 16));
  wrap.append(btn);
  btn.addEventListener("click", e => {
    e.stopPropagation();
    const open = wrap.querySelector(".menu");
    document.querySelectorAll(".menu").forEach(m => m.remove());
    if (open) return;
    const arr = ensureArr(COLLECTIONS[key].path);
    const del = h("button", { type: "button", class: "danger" }, icon("trash", 15), "Delete");
    del.addEventListener("click", ev => {
      ev.stopPropagation();
      if (del.dataset.armed !== "1") { del.dataset.armed = "1"; del.lastChild.textContent = "Click again to delete"; return; }
      arr.splice(i, 1); changed(); refreshList(key); toast(`Deleted. Press Save & publish to update the site.`);
    });
    const m = h("div", { class: "menu", role: "menu" },
      h("button", { type: "button", onclick: () => editItem(key, i) }, icon("edit", 15), "Edit"),
      h("button", { type: "button", disabled: !canMove || i === 0, onclick: () => { move(arr, i, -1); changed(); refreshList(key); } }, icon("up", 15), "Move up"),
      h("button", { type: "button", disabled: !canMove || i === n - 1, onclick: () => { move(arr, i, 1); changed(); refreshList(key); } }, icon("down", 15), "Move down"),
      h("button", { type: "button", onclick: () => { arr.splice(i + 1, 0, JSON.parse(JSON.stringify(arr[i]))); changed(); refreshList(key); toast("Copy added below."); } }, icon("copy", 15), "Duplicate"),
      del);
    wrap.append(m);
    btn.setAttribute("aria-expanded", "true");
  });
  return wrap;
}
document.addEventListener("click", e => {
  if (!e.target.closest(".row-menu")) document.querySelectorAll(".menu").forEach(m => m.remove());
  if (!e.target.closest(".bell-wrap")) { $("#bellPop").hidden = true; $("#bellBtn").setAttribute("aria-expanded", "false"); }
  if (!e.target.closest(".topbar .search")) $("#searchResults").hidden = true;
});
const refreshList = key => { if (state.view === "list/" + key) go(state.view, true); };

function addItem(key) {
  const col = COLLECTIONS[key];
  const f = fieldDef(col.section, col.field);
  const arr = ensureArr(col.path);
  arr.push(f.newItem ? f.newItem() : {});
  changed();
  refreshList(key);
  editItem(key, arr.length - 1, true);
}

/* ---------- drawer ---------- */
let drawerCtx = null;
function editItem(key, i, isNew) {
  const col = COLLECTIONS[key];
  const f = fieldDef(col.section, col.field);
  const arr = ensureArr(col.path);
  const item = arr[i];
  if (!item) return;
  drawerCtx = { key, i, item, isNew };
  $("#drawerTitle").textContent = isNew ? `New ${col.single}` : `Edit ${col.single}`;
  const body = $("#drawerBody"); body.innerHTML = "";
  renderFields(body, item, f.fields);
  const del = $("#drawerDelete"); del.textContent = isNew ? "Cancel" : "Delete"; del.dataset.armed = "";
  $("#drawerBg").hidden = false; $("#drawer").hidden = false;
  setTimeout(() => { const first = body.querySelector("input,textarea,select"); first && first.focus(); }, 30);
}
function closeDrawer(silent) {
  if ($("#drawer").hidden) return;
  $("#drawer").hidden = true; $("#drawerBg").hidden = true;
  const ctx = drawerCtx; drawerCtx = null;
  if (!silent && ctx) refreshList(ctx.key);
}
$("#drawerClose").addEventListener("click", () => closeDrawer());
$("#drawerDone").addEventListener("click", () => closeDrawer());
$("#drawerBg").addEventListener("click", () => closeDrawer());
addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  if (!$("#previewModal").hidden) return closePreviewModal();
  if (!$("#drawer").hidden) closeDrawer();
});
$("#drawerDelete").addEventListener("click", () => {
  const ctx = drawerCtx; if (!ctx) return;
  const b = $("#drawerDelete");
  if (!ctx.isNew && b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "Click again to delete"; return; }
  const arr = ensureArr(COLLECTIONS[ctx.key].path);
  const idx = arr.indexOf(ctx.item);
  if (idx > -1) arr.splice(idx, 1);
  changed(); closeDrawer();
  if (!ctx.isNew) toast("Deleted. Press Save & publish to update the site.");
});

/* =====================================================================
   section grid + form view
   ===================================================================== */
function viewSectionGrid(v, settings) {
  const list = SECTIONS.filter(s => settings ? SETTINGS_KEYS.includes(s.key) : !SETTINGS_KEYS.includes(s.key));
  v.append(pageHead(settings ? "Settings" : "Page sections",
    settings ? "Contact details, brand name and how your site shows on Google." : "Every part of your landing page, top to bottom. Click one to edit it.",
    null, [previewBtn()]));
  const grid = h("div", { class: "sec-grid" });
  for (const s of list) {
    grid.append(h("button", { class: "sec-card", type: "button", onclick: () => go("section/" + s.key) },
      h("span", { class: "s-icon", text: s.icon }), h("h3", { text: s.label }),
      h("p", { text: s.help || sectionSummary(s) }),
      sectionChanged(s.key) ? h("span", { class: "chip tone-orange edited", text: "Unsaved changes" }) : null));
  }
  v.append(grid);
}
function sectionSummary(s) {
  const val = state.content[s.key];
  if (Array.isArray(val)) return `${val.length} items`;
  if (val && val.title) return clip(val.title, 70);
  return "Edit this section";
}

function viewSection(v, key) {
  const sec = sectionDef(key);
  const settings = SETTINGS_KEYS.includes(key);
  const parent = settings ? ["settings", "Settings"] : COLLECTIONS[key] ? ["list/" + key, COLLECTIONS[key].title] : ["sections", "Page sections"];
  v.append(pageHead(sec.label, sec.help || "", [h("button", { type: "button", text: parent[1], onclick: () => go(parent[0]) }), "/", sec.label]));
  const form = h("div", { class: "card form-card" });
  if (sec.list) {
    if (!Array.isArray(state.content[key])) state.content[key] = [];
    form.append(stringsField(state.content, key, sec.list));
  } else {
    if (!state.content[key] || typeof state.content[key] !== "object") state.content[key] = {};
    renderFields(form, state.content[key], sec.fields);
  }
  const stage = h("div", { class: "preview-stage", id: "inlineStage" });
  const seg = h("div", { class: "seg", role: "group", "aria-label": "Preview size" },
    h("button", { type: "button", "data-device": "desktop", "aria-pressed": String(device === "desktop") , text: "Computer" }),
    h("button", { type: "button", "data-device": "phone", "aria-pressed": String(device === "phone"), text: "Phone" }));
  const pcard = h("div", { class: "card preview-card" }, h("div", { class: "card-title" }, h("h2", { text: "Live preview" }), seg), stage);
  v.append(h("div", { class: "form-layout" }, form, pcard));
  bindDeviceButtons(seg);
  mountPreview(stage, ANCHORS[key]);
}

/* =====================================================================
   field builders
   ===================================================================== */
function renderFields(parent, obj, fields) { for (const f of fields) parent.append(fieldFor(obj, f)); }
function fieldFor(obj, f) {
  switch (f.type) {
    case "textarea": return textField(obj, f, true);
    case "image": return mediaField(obj, f, "image");
    case "file": return mediaField(obj, f, "file");
    case "toggle": return toggleField(obj, f);
    case "color": return colorField(obj, f);
    case "category": return categoryField(obj, f);
    case "strings": if (!Array.isArray(obj[f.key])) obj[f.key] = []; return stringsField(obj, f.key, f);
    case "items": if (!Array.isArray(obj[f.key])) obj[f.key] = []; return itemsField(obj, f);
    case "group": {
      if (!obj[f.key] || typeof obj[f.key] !== "object") obj[f.key] = {};
      const box = h("div", { class: "group" }, h("span", { class: "field-label", text: f.label }));
      renderFields(box, obj[f.key], f.fields); return box;
    }
    default: return textField(obj, f, false);
  }
}
function textField(obj, f, multi) {
  const id = "f" + (++uid);
  const input = multi ? h("textarea", { id, rows: 4 }) : h("input", { id, type: f.type === "url" ? "url" : "text", spellcheck: f.type === "url" ? "false" : null });
  input.value = obj[f.key] ?? "";
  const wrap = h("div", { class: "field" }, h("label", { for: id, text: f.label }), input);
  if (f.counter) {
    const counter = h("span", { class: "counter" }); wrap.append(counter);
    const upd = () => { const n = input.value.length; counter.textContent = `${n} / ${f.counter}`; counter.classList.toggle("over", n > f.counter); };
    upd(); input.addEventListener("input", upd);
  }
  input.addEventListener("input", () => { obj[f.key] = input.value; changed(); });
  return wrap;
}
function toggleField(obj, f) {
  const id = "f" + (++uid);
  const box = h("input", { id, type: "checkbox" });
  box.checked = obj[f.key] === undefined ? f.key === "show" : !!obj[f.key];
  box.addEventListener("change", () => { obj[f.key] = box.checked; changed(); });
  return h("div", { class: "field" }, h("label", { class: "toggle", for: id }, box, f.label));
}
function colorField(obj, f) {
  const id = "f" + (++uid);
  const pick = h("input", { id, type: "color" });
  const text = h("input", { type: "text", "aria-label": f.label + " code" });
  const val = /^#[0-9a-f]{6}$/i.test(obj[f.key] || "") ? obj[f.key] : "#9b74ee";
  pick.value = val; text.value = obj[f.key] || val;
  pick.addEventListener("input", () => { text.value = pick.value; obj[f.key] = pick.value; changed(); });
  text.addEventListener("input", () => { obj[f.key] = text.value; if (/^#[0-9a-f]{6}$/i.test(text.value)) pick.value = text.value; changed(); });
  return h("div", { class: "field" }, h("label", { for: id, text: f.label }), h("div", { class: "color-row" }, pick, text));
}
function categoryField(obj, f) {
  const id = "f" + (++uid);
  const sel = h("select", { id });
  const cats = state.content.work?.categories || [];
  for (const c of cats) sel.append(h("option", { value: c.id, text: c.label || c.id }));
  if (obj[f.key] && !cats.some(c => c.id === obj[f.key])) sel.append(h("option", { value: obj[f.key], text: obj[f.key] + " (no filter button)" }));
  sel.value = obj[f.key] || (cats[0] && cats[0].id) || "";
  if (!obj[f.key] && sel.value) obj[f.key] = sel.value;
  sel.addEventListener("change", () => { obj[f.key] = sel.value; changed(); });
  return h("div", { class: "field" }, h("label", { for: id, text: f.label }), sel);
}
function delButton(onDelete) {
  const b = h("button", { class: "icon-btn del", type: "button", title: "Delete", "aria-label": "Delete" }, icon("trash", 15));
  b.addEventListener("click", () => {
    if (b.classList.contains("confirm")) return onDelete();
    b.classList.add("confirm"); b.textContent = "Delete?";
    setTimeout(() => { if (b.isConnected) { b.classList.remove("confirm"); b.textContent = ""; b.append(icon("trash", 15)); } }, 3000);
  });
  return b;
}
const moveBtn = (dir, disabled, fn) => h("button", { class: "icon-btn", type: "button", title: dir < 0 ? "Move up" : "Move down", "aria-label": dir < 0 ? "Move up" : "Move down", disabled, onclick: fn }, icon(dir < 0 ? "up" : "down", 15));
const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };

function stringsField(obj, key, f) {
  const wrap = h("div", { class: "field" }, h("span", { class: "field-label", text: f.label }));
  const listEl = h("div", { class: "strings" }); wrap.append(listEl);
  const draw = focusIndex => {
    listEl.innerHTML = "";
    const arr = obj[key];
    arr.forEach((val, i) => {
      const input = f.multiline ? h("textarea", { rows: 4, "aria-label": `${f.label} ${i + 1}` }) : h("input", { type: "text", "aria-label": `${f.label} ${i + 1}` });
      input.value = val ?? "";
      input.addEventListener("input", () => { arr[i] = input.value; changed(); });
      listEl.append(h("div", { class: "str-row" }, input, h("div", { class: "row-tools" },
        moveBtn(-1, i === 0, () => { move(arr, i, -1); changed(); draw(); }),
        moveBtn(1, i === arr.length - 1, () => { move(arr, i, 1); changed(); draw(); }),
        delButton(() => { arr.splice(i, 1); changed(); draw(); }))));
      if (i === focusIndex) setTimeout(() => input.focus(), 0);
    });
    listEl.append(h("button", { class: "add-btn", type: "button", onclick: () => { arr.push(""); changed(); draw(arr.length - 1); } }, icon("plus", 15), f.addLabel || "Add"));
  };
  draw(); return wrap;
}

function itemsField(obj, f) {
  const wrap = h("div", { class: "field" }, h("span", { class: "field-label", text: f.label }));
  const listEl = h("div", { class: "items" }); wrap.append(listEl);
  const open = new Set();
  const draw = newIndex => {
    listEl.innerHTML = "";
    const arr = obj[f.key];
    arr.forEach((item, i) => {
      const isOpen = open.has(item) || i === newIndex;
      if (i === newIndex) open.add(item);
      const titleText = () => (f.title && f.title(item) || "").trim() || "(untitled)";
      const tSpan = h("span", { class: "t", text: titleText() });
      const thumb = f.thumb ? h("img", { class: "thumb", alt: "", src: imgSrc(item[f.thumb]) || null }) : null;
      const body = h("div", { class: "item-body" });
      const card = h("div", { class: "item" + (i === newIndex ? " new" : ""), "open-state": String(isOpen) });
      const toggleBtn = h("button", { class: "open-btn", type: "button", "aria-expanded": String(isOpen),
        onclick: () => { const now = card.getAttribute("open-state") !== "true"; card.setAttribute("open-state", String(now)); toggleBtn.setAttribute("aria-expanded", String(now)); body.hidden = !now; now ? open.add(item) : open.delete(item); } },
        h("span", { class: "num", text: String(i + 1) }), thumb, tSpan, h("span", { class: "chev" }, icon("chev", 16)));
      card.append(h("div", { class: "item-head" }, toggleBtn,
        moveBtn(-1, i === 0, () => { move(arr, i, -1); changed(); draw(); }),
        moveBtn(1, i === arr.length - 1, () => { move(arr, i, 1); changed(); draw(); }),
        h("button", { class: "icon-btn", type: "button", title: "Duplicate", "aria-label": "Duplicate", onclick: () => { arr.splice(i + 1, 0, JSON.parse(JSON.stringify(item))); changed(); draw(i + 1); } }, icon("copy", 15)),
        delButton(() => { arr.splice(i, 1); open.delete(item); changed(); draw(); })), body);
      body.hidden = !isOpen;
      renderFields(body, item, f.fields);
      const upd = () => { tSpan.textContent = titleText(); if (thumb) thumb.src = imgSrc(item[f.thumb]) || ""; };
      body.addEventListener("input", upd); body.addEventListener("change", upd);
      listEl.append(card);
      if (i === newIndex) setTimeout(() => { card.scrollIntoView({ block: "nearest", behavior: "smooth" }); const first = body.querySelector("input,textarea"); first && first.focus(); }, 0);
    });
    listEl.append(h("button", { class: "add-btn", type: "button", onclick: () => { arr.push(f.newItem ? f.newItem() : {}); changed(); draw(arr.length - 1); } }, icon("plus", 15), f.addLabel || "Add"));
  };
  draw(); return wrap;
}

function mediaField(obj, f, kind) {
  const id = "f" + (++uid);
  const input = h("input", { id, type: "text", spellcheck: "false", placeholder: kind === "image" ? "img/… or upload a picture" : "https://… or upload a PDF" });
  input.value = obj[f.key] || "";
  const thumb = kind === "image" ? h("img", { class: "media-thumb", alt: "" }) : null;
  const note = h("p", { class: "media-note" });
  const picker = h("input", { type: "file", accept: kind === "image" ? "image/jpeg,image/png,image/webp" : "application/pdf,image/jpeg,image/png", hidden: true });
  const upBtn = h("button", { class: "btn btn-soft btn-sm", type: "button", text: kind === "image" ? "Upload picture" : "Upload PDF", onclick: () => picker.click() });
  const clearBtn = h("button", { class: "btn btn-sm", type: "button", style: "color:var(--muted);background:none", text: "Remove", onclick: () => set("") });
  const showThumb = () => { if (thumb) { const s = imgSrc(input.value); thumb.src = s || ""; thumb.style.visibility = s ? "visible" : "hidden"; } };
  const set = val => { obj[f.key] = val; input.value = val; showThumb(); changed(); input.dispatchEvent(new Event("change", { bubbles: true })); };
  input.addEventListener("input", () => { obj[f.key] = input.value.trim(); showThumb(); changed(); });
  picker.addEventListener("change", async () => {
    const file = picker.files && picker.files[0]; picker.value = "";
    if (!file) return;
    if (DEMO) return toast("Uploads work on your live website after you log in.", true);
    upBtn.disabled = true; note.textContent = "Uploading…";
    try {
      const prepared = file.type === "application/pdf" ? await readFile(file) : await shrinkImage(file);
      if (prepared.size > 3_000_000) throw new Error("That file is too big. Please use one under 3 MB.");
      const res = await api("/api/upload", { method: "POST", body: { name: file.name, type: prepared.type, data: prepared.data } });
      state.uploads[res.path] = prepared.preview || "";
      set(res.path);
      note.textContent = "Uploaded. Press Save & publish to put it on the site.";
    } catch (ex) {
      if (ex.status === 401) return showLogin("Your session ended. Please log in again. Your changes are kept.");
      note.textContent = ""; toast(ex.message, true);
    } finally { upBtn.disabled = false; }
  });
  showThumb();
  return h("div", { class: "field" }, h("label", { for: id, text: f.label }),
    h("div", { class: "media", style: thumb ? null : "grid-template-columns:minmax(0,1fr)" }, thumb,
      h("div", { class: "media-side" }, input, h("div", { class: "media-btns" }, upBtn, clearBtn), note, picker)));
}
function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res({ type: file.type, data: r.result, size: file.size, preview: URL.createObjectURL(file) });
    r.onerror = () => rej(new Error("Couldn't read that file."));
    r.readAsDataURL(file);
  });
}
async function shrinkImage(file) {
  const url = URL.createObjectURL(file);
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("That picture couldn't be opened.")); i.src = url; });
  const MAX = 1800;
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const keepPng = file.type === "image/png" && file.size < 1_500_000 && scale === 1;
  if (keepPng || (scale === 1 && file.size < 900_000)) return { ...(await readFile(file)), preview: url };
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale); c.height = Math.round(img.naturalHeight * scale);
  const ctx = c.getContext("2d"); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(img, 0, 0, c.width, c.height);
  const data = c.toDataURL("image/jpeg", 0.86);
  return { type: "image/jpeg", data, size: Math.round(data.length * 0.75), preview: url };
}

/* =====================================================================
   save / undo / drafts / bell / search
   ===================================================================== */
let draftTimer;
function changed() {
  refreshChrome();
  clearTimeout(draftTimer);
  draftTimer = setTimeout(() => { if (isDirty()) store.set(DRAFT_KEY, JSON.stringify({ content: state.content, at: Date.now() })); else store.del(DRAFT_KEY); }, 800);
  schedulePreview();
}
function refreshChrome() {
  const dirty = isDirty();
  $("#saveBtn").disabled = !dirty || state.saving || DEMO;
  $("#discardBtn").disabled = !dirty || state.saving;
  $("#bellDot").hidden = !dirty;
  if (!state.saving) {
    if (DEMO) setStatus(dirty ? "Demo mode · unsaved" : "Demo mode", dirty ? "dirty" : "");
    else setStatus(dirty ? "Unsaved changes" : "All saved", dirty ? "dirty" : "ok");
  }
  const av = $("#avatar"); const src = imgSrc(state.content?.about?.photo);
  if (src && av.getAttribute("src") !== src) av.src = src;
  av.alt = state.content?.brand?.ownerName || "";
}
$("#saveBtn").addEventListener("click", async () => {
  if (!isDirty() || state.saving) return;
  const problem = validate();
  if (problem) return toast(problem, true);
  state.saving = true; refreshChrome(); setStatus("Publishing…");
  try {
    const res = await api("/api/content", { method: "PUT", body: { content: state.content, sha: state.sha } });
    state.sha = res.sha; state.saved = JSON.stringify(state.content); state.lastSaved = new Date();
    store.del(DRAFT_KEY);
    toast("Saved! Your live site will show the changes in about a minute.");
  } catch (ex) {
    if (ex.status === 401) { state.saving = false; return showLogin("Your session ended. Log in again, then press Save & publish. Your changes are kept."); }
    toast(ex.message, true);
  } finally {
    state.saving = false; refreshChrome();
    if (state.view === "dashboard") go("dashboard", true);
  }
});
$("#discardBtn").addEventListener("click", () => {
  const b = $("#discardBtn");
  if (b.dataset.armed !== "1") { b.dataset.armed = "1"; b.textContent = "Click again to undo all"; setTimeout(() => { b.dataset.armed = ""; b.textContent = "Undo"; }, 3500); return; }
  b.dataset.armed = ""; b.textContent = "Undo";
  state.content = JSON.parse(state.saved); store.del(DRAFT_KEY);
  changed(); go(state.view, true); toast("Changes undone.");
});
function validate() {
  const c = state.content; const ids = new Set();
  for (const k of c.work?.categories || []) {
    if (!k.id || !/^[a-z0-9-]+$/i.test(k.id)) return `Filter button "${k.label || "?"}" needs a short code with letters only (Case studies → Section text).`;
    if (ids.has(k.id)) return `Two filter buttons use the code "${k.id}". Each needs its own.`;
    ids.add(k.id);
  }
  for (const it of c.work?.items || []) if (!(it.title || "").trim()) return "Every case study needs a book title.";
  if (c.contact?.whatsapp && /\D/.test(c.contact.whatsapp.replace(/[\s+]/g, ""))) return "The WhatsApp number should only contain digits.";
  return "";
}
addEventListener("beforeunload", e => { if (isDirty()) { e.preventDefault(); e.returnValue = ""; } });

$("#bellBtn").addEventListener("click", e => {
  e.stopPropagation();
  const pop = $("#bellPop"); const show = pop.hidden;
  pop.hidden = !show; $("#bellBtn").setAttribute("aria-expanded", String(show));
  if (!show) return;
  pop.innerHTML = "";
  const changedSecs = SECTIONS.filter(s => sectionChanged(s.key));
  pop.append(h("h3", { text: changedSecs.length ? "Not published yet" : "Everything is published" }));
  if (!changedSecs.length) pop.append(h("p", { class: "muted", text: "Your live site matches what you see here." }));
  else pop.append(h("ul", {}, ...changedSecs.map(s => h("li", {}, h("button", { type: "button", text: s.label, onclick: () => { pop.hidden = true; go(COLLECTIONS[s.key] ? "list/" + s.key : "section/" + s.key); } })))));
});

const searchBox = $("#searchBox"), results = $("#searchResults");
searchBox.addEventListener("input", () => {
  const q = searchBox.value.trim().toLowerCase();
  results.innerHTML = "";
  if (!q) { results.hidden = true; return; }
  const hits = [];
  for (const s of SECTIONS) if (s.label.toLowerCase().includes(q)) hits.push({ label: s.label, kind: SETTINGS_KEYS.includes(s.key) ? "Setting" : "Section", run: () => go("section/" + s.key) });
  for (const [key, col] of Object.entries(COLLECTIONS)) {
    ensureArr(col.path).forEach((it, i) => { if (col.search(it).toLowerCase().includes(q)) hits.push({ label: clip(col.search(it), 60), kind: col.single, run: () => { go("list/" + key); setTimeout(() => editItem(key, i), 30); } }); });
  }
  if (!hits.length) results.append(h("p", { class: "muted", style: "padding:10px", text: "No matches." }));
  for (const hit of hits.slice(0, 12)) results.append(h("button", { type: "button", onclick: () => { results.hidden = true; searchBox.value = ""; hit.run(); } }, h("span", { text: hit.label }), h("small", { text: hit.kind })));
  results.hidden = false;
});
searchBox.addEventListener("keydown", e => { if (e.key === "Enter") { const first = results.querySelector("button"); first && first.click(); } if (e.key === "Escape") { results.hidden = true; } });

/* =====================================================================
   live preview (one iframe, moved between the inline card and the modal)
   ===================================================================== */
const frame = $("#previewFrame");
let device = "desktop", previewTimer, pendingScroll = null, currentStage = null;
const ANCHORS = {
  hero: "#top", book: "#services", platforms: ".strip", problem: "[aria-labelledby=h-problem]", services: "#services",
  work: "#work", process: "#process", about: "#about", reviews: "#reviews", packages: "#packages",
  promises: "[aria-labelledby=h-promise]", faq: "#faq", quote: "#quote", lastCall: ".last-call",
  footer: ".foot", contact: ".foot", brand: "#top", nav: "#top", seo: "#top"
};
function mountPreview(stage, anchor) {
  currentStage = stage;
  stage.append(frame);
  pendingScroll = anchor || null;
  fitPreview(); drawPreview();
  ro.disconnect(); ro.observe(stage);
}
function schedulePreview(delay = 500) { if (!currentStage) return; clearTimeout(previewTimer); previewTimer = setTimeout(drawPreview, delay); }
function drawPreview() {
  if (!state.content || !currentStage || !currentStage.isConnected) return;
  let html;
  try { html = renderPage(state.content); } catch (ex) { console.error(ex); return; }
  html = html.replace("<head>", `<head><base href="${SITE_ROOT}">`).replace(/url\('\//g, `url('${SITE_ROOT}`);
  for (const [path, blob] of Object.entries(state.uploads)) if (blob) html = html.split(path).join(blob);
  let y = 0;
  try { y = frame.contentWindow.scrollY || 0; } catch { /* first load */ }
  frame.onload = () => {
    try {
      const w = frame.contentWindow;
      w.document.documentElement.style.scrollBehavior = "auto";
      if (pendingScroll) { const el = w.document.querySelector(pendingScroll); pendingScroll = null; if (el) w.scrollTo(0, el.getBoundingClientRect().top + w.scrollY - 70); }
      else w.scrollTo(0, y);
      w.document.addEventListener("click", ev => { const a = ev.target.closest("a"); if (a && !(a.getAttribute("href") || "").startsWith("#")) ev.preventDefault(); }, true);
    } catch { /* ignore */ }
  };
  frame.srcdoc = html;
}
function fitPreview() {
  const stage = currentStage; if (!stage) return;
  const W = stage.clientWidth, H = stage.clientHeight;
  if (!W || !H) return;
  if (device === "phone") {
    const s = Math.min(1, (H - 24) / 820);
    frame.style.width = "390px"; frame.style.height = "820px";
    frame.style.transform = `translateX(-50%) translateY(12px) scale(${s})`; frame.style.transformOrigin = "50% 0";
  } else {
    const base = 1280, s = W / base;
    frame.style.width = base + "px"; frame.style.height = Math.ceil(H / s) + "px";
    frame.style.transform = `scale(${s})`; frame.style.transformOrigin = "0 0";
  }
  stage.classList.toggle("phone", device === "phone");
}
const ro = new ResizeObserver(fitPreview);
function bindDeviceButtons(root) {
  root.querySelectorAll("[data-device]").forEach(b => b.addEventListener("click", () => {
    device = b.dataset.device;
    document.querySelectorAll("[data-device]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.device === device)));
    fitPreview();
  }));
}
bindDeviceButtons($("#previewModal"));
let stageBeforeModal = null;
function openPreviewModal() {
  stageBeforeModal = currentStage && currentStage.id === "inlineStage" ? currentStage : null;
  $("#previewModal").hidden = false;
  const key = state.view.split("/")[1];
  mountPreview($("#previewStage"), ANCHORS[key] || null);
}
function closePreviewModal() {
  $("#previewModal").hidden = true;
  if (stageBeforeModal && stageBeforeModal.isConnected) mountPreview(stageBeforeModal, null);
  else { currentStage = null; ro.disconnect(); }
}
$("#previewClose").addEventListener("click", closePreviewModal);
$("#previewModal").addEventListener("click", e => { if (e.target.id === "previewModal") closePreviewModal(); });

boot();
