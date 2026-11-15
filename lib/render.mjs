// Builds the full landing page HTML from content/content.json.
// Used by build.mjs on Vercel (Node) and by the admin's live preview (browser).
// Design: "storybook" — paper, ink, coral, sun and sage. Serif headings, Manrope body.

const ESC = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = v => String(v ?? "").replace(/[&<>"']/g, ch => ESC[ch]);

// **bold** support for paragraphs, everything else escaped
const rich = v => esc(v).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

// only allow safe link targets
const safeUrl = v => {
  const s = String(v ?? "").trim();
  if (!s) return "";
  if (/^(https?:|mailto:|tel:|#|\/|img\/)/i.test(s) || /^[\w./-]+$/.test(s)) return s;
  return "";
};
const list = v => (Array.isArray(v) ? v : []);
const ext = url => (/^https?:/i.test(url) ? ' target="_blank" rel="noopener"' : "");
const svg = (inner, size = 24, extra = "") =>
  `<svg viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"${extra}>${inner}</svg>`;

/* ---------- brand icons (filled) ---------- */
const ICONS = {
  instagram: '<path fill="currentColor" d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.4 8.2c-.1-1.5-.4-2.8-1.5-3.9s-2.4-1.4-3.9-1.5C14.5 2.7 9.5 2.7 7.9 2.8c-1.5.1-2.8.4-3.9 1.5S2.6 6.7 2.5 8.2c-.1 1.6-.1 6.6 0 8.2.1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.6.1 6.6.1 8.2 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.6.1-6.6 0-8.2Zm-2.1 9.9a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.6.4s-4.4.1-5.6-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.6s-.1-4.4.4-5.6a3.2 3.2 0 0 1 1.8-1.8c1.3-.5 4.3-.4 5.6-.4s4.4-.1 5.6.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.6Z"/>',
  threads: '<path fill="currentColor" d="M16.7 11.2c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.6 0-3 .7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1.4 0 2.4.5 2.7 2.2a10 10 0 0 0-2.4-.1c-2.4.1-4 1.6-3.9 3.5.1 2 1.9 3.2 4 3.1 1.6-.1 3.3-1 3.7-3.6.7.4 1.2 1 1.4 1.6.4 1 .5 2.6-.8 3.9-1.1 1.1-2.5 1.6-4.5 1.6-2.3 0-4-.7-5.1-2.2-1-1.3-1.6-3.2-1.6-5.6s.5-4.3 1.6-5.6C8 5.6 9.7 4.9 12 4.9c2.3 0 4 .7 5.2 2.2.6.7 1 1.6 1.3 2.6l1.8-.5c-.3-1.3-.9-2.4-1.6-3.3C17.2 4 15 3.1 12 3.1 9.1 3.1 7 4 5.6 5.8 4.3 7.4 3.7 9.6 3.6 12.5c0 2.9.7 5.1 2 6.7 1.4 1.8 3.5 2.7 6.4 2.7 2.5 0 4.2-.7 5.7-2.1 1.9-1.9 1.8-4.3 1.2-5.8-.4-1.1-1.2-2-2.2-2.8Zm-4.6 4.6c-1 .1-2-.4-2.1-1.3 0-.7.5-1.5 2.1-1.6h.5c.6 0 1.2.1 1.7.2-.2 2.2-1.2 2.6-2.2 2.7Z"/>',
  linkedin: '<path fill="currentColor" d="M6.9 8.6H3.4V20h3.5V8.6ZM5.2 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM20.6 13.7c0-3.1-.7-5.4-4.3-5.4-1.7 0-2.9.9-3.3 1.8V8.6H9.6V20h3.5v-5.6c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3V20h3.6v-6.3Z"/>',
  upwork: '<path fill="currentColor" d="M17.5 6.6c-2.3 0-4 1.5-4.7 3.9-1.1-1.6-1.9-3.6-2.4-5.3H8v6.5a2.4 2.4 0 1 1-4.8 0V5.2H.9v6.5a4.7 4.7 0 0 0 9.4 0v-1.1c.5 1 1 2 1.7 2.9l-1.5 7h2.4l1.1-5c1 .6 2.1 1 3.4 1a4.9 4.9 0 0 0 0-9.9Zm0 7.6c-1 0-2-.4-2.8-1.1l.2-1c.2-1.2.9-3.1 2.6-3.1a2.6 2.6 0 0 1 0 5.2Z"/>',
  tiktok: '<path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"/>',
  fiverr: '<path fill="currentColor" d="M20 9.5h-2.6v8.2h-2.9V9.5h-1.9V7.9c0-.4.2-.6.6-.6h1.3V6c0-1.6 1-2.4 2.9-2.4h1.6v2.3h-1c-.5 0-.8.3-.8.8v1.2h2.8v1.6Zm-11.6 0H6.3V17.7H3.4V9.5H2V7.3h1.4V6.2C3.4 4.3 4.6 3.4 6.6 3.4h1.6v2.3h-1c-.5 0-.8.3-.8.8v.8h2v2.2Z"/>',
  whatsapp: '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/>',
  mail: '<path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-7.4 5.2a1 1 0 0 1-1.2 0L4 7.4ZM5.6 7l6.4 4.5L18.4 7H5.6Z"/>'
};

/* ---------- doodle icons (hand-drawn style strokes) ---------- */
const D = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const DOODLE = {
  face: `<g ${D}><circle cx="12" cy="12" r="8.5"/><path d="M8.6 10.2h.01M15.4 10.2h.01"/><path d="M8.5 14.4c1.9 2 5.1 2 7 0"/><path d="M5 6.5c1.4-.8 2.3-.6 3.1.4"/></g>`,
  brush: `<g ${D}><path d="M14.5 4.5 19.5 9.5 11 18l-5-5z"/><path d="M6 13c-2 .5-3 2-3 4.5 0 1.3-.4 2-1 2.5 3 .3 6.2-.6 6.8-3.3"/><path d="m16.2 3.3 4.5 4.5"/></g>`,
  cover: `<g ${D}><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M5 17a3 3 0 0 1 3-3h11"/><path d="m10.5 7.5.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.3.7.2-1.5-1-1 1.5-.2z"/></g>`,
  file: `<g ${D}><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="m9.5 14 2 2 3.8-4"/></g>`,
  layout: `<g ${D}><rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M12 4v16"/><path d="M6 8h3.5M6 11h3.5M6 14h3.5M14.5 8h3.5M14.5 11h3.5"/></g>`,
  pencil: `<g ${D}><path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/></g>`,
  heart: `<g ${D}><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></g>`,
  check: `<g ${D}><circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.2 2.6 2.6 5-5.2"/></g>`,
  chat: `<g ${D}><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/></g>`,
  star: `<g ${D}><path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z"/></g>`
};
const PROBLEM_ICONS = ["face", "brush", "cover", "file"];
const ADDON_ICONS = ["cover", "layout", "star", "brush"];
const PROMISE_ICONS = ["pencil", "heart", "check", "chat"];
const PROMISE_TONES = ["sage", "coral", "sun", "plum"];

const SOCIALS = [
  ["instagram", "Instagram"], ["threads", "Threads"], ["linkedin", "LinkedIn"], ["upwork", "Upwork"], ["tiktok", "TikTok"], ["fiverr", "Fiverr"]
];

const starsOf = n => {
  const k = Math.max(0, Math.min(5, Math.round(Number(n) || 5)));
  return "★".repeat(k) + "☆".repeat(5 - k);
};

// small decorative shapes
const PAPER_STAR = '<svg class="deco-star" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>';
const CLOUD = '<svg class="deco-cloud" viewBox="0 0 120 60" aria-hidden="true"><path d="M30 52h64a22 22 0 0 0 2-44 26 26 0 0 0-48 4A20 20 0 0 0 30 52z"/></svg>';

export function renderPage(c, opts = {}) {
  c = c || {};
  const seo = c.seo || {}, brand = c.brand || {}, ct = c.contact || {};
  const hero = c.hero || {}, book = c.book || {}, prob = c.problem || {}, svc = c.services || {};
  const work = c.work || {}, proc = c.process || {}, about = c.about || {}, rev = c.reviews || {};
  const pk = c.packages || {}, prom = c.promises || {}, faq = c.faq || {}, qt = c.quote || {};
  const last = c.lastCall || {}, foot = c.footer || {};
  const brandName = `${brand.first || ""} ${brand.second || ""}`.trim();
  const logo = `<span class="logo-mark" aria-hidden="true">${svg('<path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 18)}</span><span class="logo-text">${esc(brand.first)} <b>${esc(brand.second)}</b></span>`;
  const waNum = String(ct.whatsapp || "").replace(/\D/g, "");
  const waLink = waNum ? `https://wa.me/${waNum}?text=${encodeURIComponent(ct.whatsappMessage || "")}` : "#quote";
  const socials = SOCIALS.filter(([k]) => safeUrl(ct[k]));
  const year = opts.year || new Date().getFullYear();
  const abs = p => (seo.siteUrl && p && !/^https?:/i.test(p) ? seo.siteUrl.replace(/\/$/, "") + "/" + p.replace(/^\//, "") : p);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: brandName,
    description: seo.description || "",
    image: abs(seo.shareImage || book.front || ""),
    ...(waNum ? { telephone: "+" + waNum } : {}),
    ...(ct.email ? { email: ct.email } : {}),
    ...(seo.siteUrl ? { url: seo.siteUrl } : {}),
    areaServed: "Worldwide",
    founder: { "@type": "Person", name: brand.ownerName || "", jobTitle: brand.ownerTitle || "", image: abs(about.photo || "") },
    sameAs: socials.map(([k]) => ct[k]),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Book design services",
      itemListElement: [svc.main?.title, ...list(svc.addons).map(a => a.title)].filter(Boolean)
        .map(name => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } }))
    }
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: list(faq.items).filter(f => f.question).map(f => ({
      "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer || "" }
    }))
  };
  const ld = o => JSON.stringify(o).replace(/</g, "\\u003c");

  // root-relative so the CSS variables resolve the same everywhere
  const rootUrl = u => { u = safeUrl(u); return !u || /^(https?:|\/)/i.test(u) ? u : "/" + u; };
  const bookStyle = [
    book.front && `--front:url('${esc(rootUrl(book.front))}')`,
    book.back && `--back:url('${esc(rootUrl(book.back))}')`,
    book.spine && `--spine:url('${esc(rootUrl(book.spine))}')`
  ].filter(Boolean).join(";");
  const frontImg = esc(safeUrl(book.front));
  const backImg = esc(safeUrl(book.back));

  const cats = list(work.categories);
  const catLabel = id => (cats.find(k => k.id === id) || {}).label || "";
  const items = list(work.items);
  const showFirst = Math.max(1, Number(work.showFirst) || 6);

  const faqItems = list(faq.items);
  const half = Math.ceil(faqItems.length / 2);
  const faqCol = arr => arr.map(f => `
          <details class="faq-item" data-reveal><summary><span>${esc(f.question)}</span><i class="pm" aria-hidden="true"></i></summary><p>${esc(f.answer)}</p></details>`).join("");

  const reviews = list(rev.items).filter(r => (r.text || "").trim() && (r.name || "").trim());
  const featured = rev.featured && rev.featured.show !== false && (rev.featured.text || "").trim() ? rev.featured : null;
  const fiverr = safeUrl(ct.fiverr);

  const contactLinks = [
    ct.email && { href: `mailto:${ct.email}`, label: "Email", color: "#E2553B", icon: ICONS.mail },
    safeUrl(ct.instagram) && { href: ct.instagram, label: "Instagram", color: "#C13584", icon: ICONS.instagram },
    safeUrl(ct.linkedin) && { href: ct.linkedin, label: "LinkedIn", color: "#0A66C2", icon: ICONS.linkedin },
    safeUrl(ct.upwork) && { href: ct.upwork, label: "Upwork", color: "#108A00", icon: ICONS.upwork },
    fiverr && { href: fiverr, label: "Fiverr", color: "#1A9E5C", icon: ICONS.fiverr },
    safeUrl(ct.threads) && { href: ct.threads, label: "Threads", color: "#2E1A3B", icon: ICONS.threads },
    safeUrl(ct.tiktok) && { href: ct.tiktok, label: "TikTok", color: "#2E1A3B", icon: ICONS.tiktok }
  ].filter(Boolean);

  // opener: each letter of the brand name pops in one after another
  let li = 0;
  const letters = (word, cls) => [...String(word || "")].map(ch =>
    `<span${cls ? ` class="${cls}"` : ""} style="animation-delay:${(0.25 + (li++) * 0.045).toFixed(3)}s">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");

  // storyboard: sketch -> colour, using the hero book's own artwork
  const STAGES = ["sketch", "lines", "flat", "final"];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(seo.title)}</title>
<meta name="description" content="${esc(seo.description)}">
<meta name="keywords" content="${esc(seo.keywords)}">
<meta name="author" content="${esc(brand.ownerName)}">
<meta name="robots" content="index, follow">
${seo.siteUrl ? `<link rel="canonical" href="${esc(seo.siteUrl)}">\n` : ""}<meta property="og:type" content="website">
<meta property="og:title" content="${esc(seo.title)}">
<meta property="og:description" content="${esc(seo.description)}">
<meta property="og:image" content="${esc(abs(seo.shareImage || book.front || ""))}">
${seo.siteUrl ? `<meta property="og:url" content="${esc(seo.siteUrl)}">\n` : ""}<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#FFF8EE">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23FF6B4A'/%3E%3Cpath fill='%23FFF8EE' d='m16 6 3.1 6.3 6.9 1-5 4.9 1.2 6.9L16 21.9l-6.2 3.2 1.2-6.9-5-4.9 6.9-1z'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=Manrope:wght@400;500;700;800&family=Caveat:wght@600;700&display=swap">
<link rel="stylesheet" href="css/styles.css">
<link rel="preload" as="image" href="${frontImg}">
<script>document.documentElement.classList.add("js")</script>
<script type="application/ld+json">${ld(jsonLd)}</script>
${faqLd.mainEntity.length ? `<script type="application/ld+json">${ld(faqLd)}</script>\n` : ""}</head>
<body class="is-opening">

<div class="opener" id="opener" aria-hidden="true">
  <i class="op-blob ob1"></i><i class="op-blob ob2"></i>
  <span class="op-star os1">${PAPER_STAR}</span><span class="op-star os2">${PAPER_STAR}</span><span class="op-star os3">${PAPER_STAR}</span>
  <div class="op-in">
    <span class="op-mark">${svg('<path fill="currentColor" d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>', 34)}</span>
    <div class="op-name">${letters(brand.first, "")}<span>&nbsp;</span>${letters(brand.second, "accent")}</div>
    ${brand.tagline ? `<p class="op-tag">${esc(brand.tagline)}</p>` : ""}
    <div class="op-bar"><i></i></div>
  </div>
</div>

<a class="skip" href="#main">Skip to content</a>

<header class="nav" id="top">
  <div class="nav-in">
    <a class="logo" href="#top" aria-label="${esc(brandName)} home">${logo}</a>
    <nav class="nav-links" aria-label="Main">
      <a href="#services">Services</a>
      <a href="#work">Books</a>
      <a href="#process">Process</a>
      <a href="#reviews">Reviews</a>
      <a href="#packages">Packages</a>
      <a href="#faq">FAQ</a>
    </nav>
    <a class="btn btn-coral btn-sm" href="#quote">${esc(c.nav?.button || "Get a quote")}</a>
  </div>
</header>

<main id="main">

  <!-- 1 · HERO -->
  <section class="hero" aria-labelledby="h1">
    <div class="hero-sky" aria-hidden="true">
      <i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i>
      <span class="float f1">${PAPER_STAR}</span><span class="float f2">${PAPER_STAR}</span><span class="float f3">${PAPER_STAR}</span>
      <span class="float c1">${CLOUD}</span><span class="float c2">${CLOUD}</span>
    </div>
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1 id="h1">${esc(hero.titleStart)} <em>${esc(hero.titleHighlight)}</em></h1>
        <p class="lede">${esc(hero.text)}</p>
        <div class="cta-row">
          <a class="btn btn-coral" href="#quote">${esc(hero.buttonMain)} <span aria-hidden="true">→</span></a>
          <a class="btn btn-line" href="#work">${esc(hero.buttonSecond)}</a>
        </div>
        <ul class="chips" aria-label="Quick facts">
${list(hero.proof).map(p => `          <li class="chip"><b>${esc(p.big)}</b> ${esc(p.small)}</li>`).join("\n")}
        </ul>
      </div>
      <div class="hero-visual" id="heroVisual">
        ${hero.note ? `<p class="hand-note" aria-hidden="true">${esc(hero.note)}<svg viewBox="0 0 90 60" class="note-arrow"><path d="M4 8c22 2 44 12 58 36" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="m52 40 11 6 2-12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></p>` : ""}
        <div class="book-layer" id="bookLayer" aria-hidden="true">
          <div class="book-pos" id="bookPos">
            <div class="book-glow"></div>
            <div class="b3d" id="book" style="${bookStyle}">
              <div class="b-back"></div>
              <div class="b-spine"></div>
              <div class="b-edge"></div>
              <div class="b-top"></div>
              <div class="b-bottom"></div>
              <div class="b-page">
                <div class="pg-art pg-art-girl"></div>
                <p class="pg-line">${esc(book.lastPage)}</p>
              </div>
              <div class="leaf" id="leaf2">
                <div class="leaf-f pg-art pg-art-snow"><p class="pg-line">${esc(book.page2Front)}</p></div>
                <div class="leaf-b pg-text"><span>${esc(book.page2Back)}</span></div>
              </div>
              <div class="leaf" id="leaf1">
                <div class="leaf-f pg-title"><span class="pg-kicker">Illustrated by</span><strong>${esc(brand.first)}<br>${esc(brand.second)}</strong><span class="pg-star">★</span></div>
                <div class="leaf-b pg-text"><span>${esc(book.page1Back)}</span></div>
              </div>
              <div class="cover" id="cover">
                <div class="cover-f"></div>
                <div class="cover-b"><span>${esc(book.insideCoverLabel)}</span><em>${esc(book.insideCoverText)}</em></div>
              </div>
            </div>
            <div class="book-shadow"></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="strip" aria-label="Platforms my files are prepared for">
    <div class="strip-track">
      ${list(c.platforms).map(p => `<span>${esc(p)}</span>`).join("")}
      ${list(c.platforms).map(p => `<span aria-hidden="true">${esc(p)}</span>`).join("")}
    </div>
  </div>

  <!-- 2 · SOUND FAMILIAR -->
  <section class="band band-blush" aria-labelledby="h-problem">
    <div class="wrap">
      <div class="head" data-reveal>
        <p class="eyebrow">${esc(prob.eyebrow)}</p>
        <h2 id="h-problem">${esc(prob.title)}</h2>
        <p class="lede">${esc(prob.text)}</p>
      </div>
      <div class="problems">
${list(prob.items).map((i, n) => `        <article class="problem" data-reveal>
          <span class="doodle tone-${["coral", "sage", "sun", "plum"][n % 4]}">${svg(DOODLE[PROBLEM_ICONS[n % PROBLEM_ICONS.length]], 28)}</span>
          <div>
            <p class="p-label">The problem</p>
            <h3>${esc(i.title)}</h3>
            <p class="p-fix"><span class="fix-label">How I fix it <span aria-hidden="true">→</span></span> ${esc(i.text)}</p>
          </div>
        </article>`).join("\n")}
      </div>
    </div>
  </section>

  <!-- 3 · SERVICES -->
  <section class="band" id="services" aria-labelledby="h-services">
    <div class="wrap">
      <div class="head" data-reveal>
        <p class="eyebrow">${esc(svc.eyebrow)}</p>
        <h2 id="h-services">${esc(svc.title)}</h2>
      </div>
      <div class="svc-layout">
        <article class="svc-feature" data-reveal>
          <div class="spread" aria-hidden="true">
            <div class="spread-page left" style="background-image:url('${backImg}')"></div>
            <div class="spread-page right" style="background-image:url('${frontImg}')"></div>
            <span class="spread-tape"></span>
          </div>
          <div class="svc-body">
            <span class="tag">${esc(svc.main?.tag)}</span>
            <h3>${esc(svc.main?.title)}</h3>
            <p>${esc(svc.main?.text)}</p>
            <ul class="ticks">
${list(svc.main?.points).map(p => `              <li>${esc(p)}</li>`).join("\n")}
            </ul>
            <a class="btn btn-coral" href="#quote">${esc(svc.button)} <span aria-hidden="true">→</span></a>
          </div>
        </article>
        <div class="svc-side">
${list(svc.addons).map((a, n) => `          <article class="svc-card" data-reveal>
            <span class="doodle tone-${n % 2 ? "sun" : "sage"}">${svg(DOODLE[ADDON_ICONS[n % ADDON_ICONS.length]], 26)}</span>
            <span class="tag tag-soft">${esc(a.tag)}</span>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.text)}</p>
          </article>`).join("\n")}
        </div>
      </div>
    </div>
  </section>

  <!-- 4 · PORTFOLIO -->
  <section class="band band-mint" id="work" aria-labelledby="h-work">
    <div class="wrap">
      <div class="head head-row" data-reveal>
        <div>
          <p class="eyebrow">${esc(work.eyebrow)}</p>
          <h2 id="h-work">${esc(work.title)}</h2>
        </div>
        <p class="lede">${esc(work.text)}</p>
      </div>
      <div class="books" id="caseGrid">
${items.map((it, n) => {
    const href = safeUrl(it.link);
    const label = catLabel(it.category);
    return `        <article class="book-card${n >= showFirst ? " is-more" : ""}" data-cat="${esc(it.category)}"${n >= showFirst ? " hidden" : ""}>
          <div class="book-img"><img src="${esc(safeUrl(it.image))}" alt="${esc(it.title)}, ${esc(it.genre)}" loading="lazy" decoding="async" width="1000" height="600"></div>
          <div class="book-body">
            ${label ? `<span class="tag tag-soft">${esc(label)}</span>` : ""}
            <h3>${esc(it.title)}</h3>
            <p class="book-genre">${esc(it.genre)}</p>
            <a class="text-link" href="${esc(href || "#quote")}"${ext(href)}>${esc(it.linkLabel || (href ? "View case study" : "Start a book like this"))} <span aria-hidden="true">→</span></a>
          </div>
        </article>`;
  }).join("\n")}
      </div>
      <div class="center-row">
        ${items.length > showFirst ? `<button class="btn btn-line" type="button" id="showMore" aria-controls="caseGrid" aria-expanded="false">${esc(work.moreButton || "Show more books")} <span class="count">(${items.length - showFirst})</span></button>` : ""}
        <a class="btn btn-coral" href="#quote">${esc(work.button)} <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <!-- 5 · HOW IT WORKS (storyboard) -->
  <section class="band" id="process" aria-labelledby="h-process">
    <div class="wrap">
      <div class="head" data-reveal>
        <p class="eyebrow">${esc(proc.eyebrow)}</p>
        <h2 id="h-process">${esc(proc.title)}</h2>
      </div>
      <ol class="storyboard">
${list(proc.steps).map((s, n) => `        <li class="frame" data-reveal>
          <span class="frame-num" aria-hidden="true">${n + 1}</span>
          <div class="frame-art stage-${STAGES[Math.min(n, 3)]}" style="background-image:url('${frontImg}')" aria-hidden="true"></div>
          <h3>${esc(s.title)}</h3>
          <p>${esc(s.text)}</p>
        </li>`).join("\n")}
      </ol>
    </div>
  </section>

  <!-- 6 · ABOUT -->
  <section class="band band-mint" id="about" aria-labelledby="h-about">
    <div class="wrap about-grid">
      <figure class="polaroid" data-reveal>
        <span class="tape t1" aria-hidden="true"></span><span class="tape t2" aria-hidden="true"></span>
        <img src="${esc(safeUrl(about.photo))}" alt="${esc(brand.ownerName)}, ${esc(brand.ownerTitle)}" width="800" height="800" decoding="async">
        ${about.photoLabel ? `<figcaption class="hand">${esc(about.photoLabel)}</figcaption>` : ""}
      </figure>
      <div class="about-copy" data-reveal>
        <p class="eyebrow">${esc(about.eyebrow)}</p>
        <h2 id="h-about">${esc(about.title)}</h2>
${list(about.paragraphs).map(p => `        <p>${rich(p)}</p>`).join("\n")}
        ${list(about.facts).length ? `<ul class="chips">${list(about.facts).map((f, n) => `<li class="chip chip-${["sage", "coral", "sun"][n % 3]}">${esc(f)}</li>`).join("")}</ul>` : ""}
        ${socials.length ? `<p class="socials">Find me on ${socials.map(([k, label]) => `<a class="text-link" href="${esc(ct[k])}" target="_blank" rel="noopener">${label}</a>`).join(" · ")}</p>` : ""}
      </div>
    </div>
  </section>

  <!-- 7 · REVIEWS -->
  <section class="band band-butter" id="reviews" aria-labelledby="h-reviews">
    <div class="wrap">
      <div class="head head-center" data-reveal>
        <p class="eyebrow">${esc(rev.eyebrow)}</p>
        <h2 id="h-reviews">${esc(rev.title)}</h2>
      </div>
${featured ? `      <figure class="review-hero" data-reveal>
        <span class="quote-mark" aria-hidden="true">“</span>
        <p class="review-badge"><span class="dot-ok" aria-hidden="true">✓</span> ${esc(featured.badge)}</p>
        <p class="review-stars"><span class="stars" aria-label="${esc(featured.score)} out of 5 stars">${starsOf(featured.score)}</span> <b>${esc(featured.score)}</b></p>
        <blockquote>${esc(featured.text)}</blockquote>
        ${list(featured.ratings).length ? `<dl class="ratings">${list(featured.ratings).map(r => `<div><dt>${esc(r.label)}</dt><dd><span class="stars" aria-hidden="true">${starsOf(r.score)}</span> ${esc(r.score)}</dd></div>`).join("")}</dl>` : ""}
      </figure>` : ""}
${reviews.length ? `      <div class="review-grid">
${reviews.map(r => `        <figure class="review-card" data-reveal>
          <span class="stars" aria-label="${esc(Math.round(Number(r.stars) || 5))} out of 5 stars">${starsOf(r.stars)}</span>
          <blockquote>${esc(r.text)}</blockquote>
          <figcaption><b>${esc(r.name)}</b>${r.role ? ` · ${esc(r.role)}` : ""}</figcaption>
        </figure>`).join("\n")}
      </div>` : ""}
      <div class="center-row">
        ${fiverr ? `<a class="btn btn-line" href="${esc(fiverr)}" target="_blank" rel="noopener">${esc(rev.fiverrLabel || "Read all reviews on Fiverr")} <span aria-hidden="true">↗</span></a>` : ""}
        <a class="btn btn-coral" href="#quote">${esc(rev.button)} <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <!-- 8 · PACKAGES -->
  <section class="band" id="packages" aria-labelledby="h-packages">
    <div class="wrap">
      <div class="head head-center" data-reveal>
        <p class="eyebrow">${esc(pk.eyebrow)}</p>
        <h2 id="h-packages">${esc(pk.title)}</h2>
        <p class="lede">${esc(pk.text)}</p>
      </div>
      <div class="packages">
${list(pk.items).map(p => `        <article class="pkg${p.highlight ? " pkg-hot" : ""}" data-reveal>
          ${p.highlight && p.badge ? `<span class="ribbon">${esc(p.badge)}</span>` : (p.badge ? `<span class="tag tag-soft">${esc(p.badge)}</span>` : "")}
          <h3>${esc(p.name)}</h3>
          ${p.price ? `<p class="price">${esc(p.price)}</p>` : ""}
          <p class="pkg-for">${esc(p.for)}</p>
          <ul class="ticks">
${list(p.features).map(f => `            <li>${esc(f)}</li>`).join("\n")}
          </ul>
          <a class="btn ${p.highlight ? "btn-white" : "btn-line"}" href="#quote" data-pkg="${esc(p.name)}">${esc(p.button || "Get a quote")}</a>
        </article>`).join("\n")}
      </div>
      ${pk.noteText || pk.noteLink ? `<p class="pkg-note">${esc(pk.noteText)} <a class="text-link" href="#quote" data-pkg="Cover or formatting only">${esc(pk.noteLink)}</a></p>` : ""}
    </div>
  </section>

  <!-- 9 · PROMISES -->
  <section class="band band-tight" aria-labelledby="h-promise">
    <div class="wrap">
      <h2 id="h-promise" class="head-center small-h" data-reveal>${esc(prom.title)}</h2>
      <div class="promises">
${list(prom.items).map((p, n) => `        <div class="promise" data-reveal><span class="icon-circle tone-${PROMISE_TONES[n % 4]}">${svg(DOODLE[PROMISE_ICONS[n % 4]], 24)}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("\n")}
      </div>
    </div>
  </section>

  <!-- 10 · FAQ -->
  <section class="band band-blush" id="faq" aria-labelledby="h-faq">
    <div class="wrap">
      <div class="head head-center" data-reveal>
        <p class="eyebrow">${esc(faq.eyebrow)}</p>
        <h2 id="h-faq">${esc(faq.title)}</h2>
      </div>
      <div class="faq-cols">
        <div class="faq-col">${faqCol(faqItems.slice(0, half))}
        </div>
        <div class="faq-col">${faqCol(faqItems.slice(half))}
        </div>
      </div>
    </div>
  </section>

  <!-- 11 · QUOTE FORM -->
  <section class="quote-band" id="quote" aria-labelledby="h-quote">
    <div class="wrap">
      <div class="quote-card" data-reveal>
        <div class="quote-intro">
          <p class="eyebrow">${esc(qt.eyebrow)}</p>
          <h2 id="h-quote">${esc(qt.title)}</h2>
          <p class="lede">${esc(qt.text)}</p>
          <div class="contact-alt">
            ${ct.email ? `<p>Prefer email? <a class="text-link" href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : ""}
            ${safeUrl(ct.upwork) ? `<p>Prefer a platform? <a class="text-link" href="${esc(ct.upwork)}" target="_blank" rel="noopener">Hire me on Upwork</a></p>` : ""}
          </div>
        </div>
        <form class="quote-form" id="quoteForm" data-wa="${esc(waNum)}" data-greeting="${esc(brand.first || "")}" novalidate>
          <div class="f-row">
            <label for="qName">Your name</label>
            <input id="qName" name="name" autocomplete="name" required placeholder="e.g. Sarah">
          </div>
          <div class="f-row">
            <label for="qService">What do you need?</label>
            <select id="qService" name="service">
${list(qt.options).map(o => `              <option>${esc(o)}</option>`).join("\n")}
            </select>
          </div>
          <div class="f-row f-half">
            <label for="qPages">Number of pages</label>
            <input id="qPages" name="pages" inputmode="numeric" placeholder="e.g. 32">
          </div>
          <div class="f-row f-half">
            <label for="qSize">Trim size (if known)</label>
            <input id="qSize" name="size" placeholder="e.g. 8.5 × 8.5 in">
          </div>
          <div class="f-row">
            <label for="qStory">Tell me about your story</label>
            <textarea id="qStory" name="story" rows="4" required placeholder="Who is the main character, and what happens?"></textarea>
          </div>
          <p class="f-error" id="qError" hidden>Please add your name and a line about your story.</p>
          <button class="btn btn-coral btn-wide" type="submit">${svg(ICONS.whatsapp, 20)} ${esc(qt.button)}</button>
        </form>
      </div>
    </div>
  </section>

  <!-- 12 · FINAL CALL TO ACTION -->
  <section class="sunrise" aria-labelledby="h-last">
    <div class="sunrise-art" aria-hidden="true">
      <i class="sun"></i><i class="moon"></i>
      <span class="twinkle s1"></span><span class="twinkle s2"></span><span class="twinkle s3"></span><span class="twinkle s4"></span><span class="twinkle s5"></span><span class="twinkle s6"></span>
      <svg class="hills" viewBox="0 0 1440 160" preserveAspectRatio="none"><path d="M0 120C180 60 360 60 520 100s320 50 480 0 300-60 440-10v50H0z" fill="#FFC83D" opacity=".55"/><path d="M0 140c220-50 420-40 620 0s420 30 820-20v40H0z" fill="#FF8F6B" opacity=".7"/></svg>
    </div>
    <div class="wrap sunrise-in" data-reveal>
      <p class="eyebrow">${esc(last.eyebrow)}</p>
      <h2 id="h-last">${esc(last.title)}</h2>
      <p class="lede">${esc(last.text)}</p>
      <div class="cta-row">
        <a class="btn btn-coral" href="${esc(waLink)}"${ext(waLink)}>${esc(last.buttonMain)} <span aria-hidden="true">→</span></a>
        <a class="btn btn-ghost-light" href="#quote">${esc(last.buttonSecond)}</a>
      </div>
      <ul class="sun-points">
${list(last.points).map(p => `        <li>${esc(p)}</li>`).join("\n")}
      </ul>
    </div>
  </section>
</main>

<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        <a class="logo" href="#top">${logo}</a>
        <p>${esc(foot.text)}</p>
        <div class="foot-social" aria-label="Social media">
${socials.map(([k, label]) => `          <a href="${esc(ct[k])}" target="_blank" rel="noopener" aria-label="${label}">${svg(ICONS[k], 18)}</a>`).join("\n")}
        </div>
      </div>
      <nav class="foot-col" aria-label="Services">
        <h3>Services</h3>
${list(foot.services).map(s => `        <a href="#services">${esc(s)}</a>`).join("\n")}
      </nav>
      <nav class="foot-col" aria-label="Quick links">
        <h3>Quick links</h3>
        <a href="#work">Books</a>
        <a href="#process">How it works</a>
        <a href="#reviews">Reviews</a>
        <a href="#about">About me</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="foot-col">
        <h3>Contact</h3>
        ${waNum ? `<a href="https://wa.me/${esc(waNum)}" target="_blank" rel="noopener">WhatsApp: ${esc(ct.whatsappDisplay || "+" + waNum)}</a>` : ""}
        ${ct.email ? `<a href="mailto:${esc(ct.email)}" class="foot-mail">${esc(ct.email)}</a>` : ""}
        ${safeUrl(ct.upwork) ? `<a href="${esc(ct.upwork)}" target="_blank" rel="noopener">Hire me on Upwork</a>` : ""}
        <p class="foot-note">${esc(foot.note)}</p>
      </div>
    </div>
    <div class="foot-bottom">
      <p>© <span id="year">${esc(year)}</span> ${esc(brandName)}. All rights reserved.</p>
      <a href="#top" class="text-link">Back to top ↑</a>
    </div>
  </div>
</footer>

<div class="fab" id="fab">
  ${contactLinks.length ? `<div class="fab-menu" id="fabMenu" hidden>
${contactLinks.map(l => `    <a href="${esc(l.href)}"${ext(l.href)} style="--c:${l.color}">${svg(l.icon, 18)}<span>${esc(l.label)}</span></a>`).join("\n")}
  </div>
  <button class="fab-contact" id="fabToggle" type="button" aria-expanded="false" aria-controls="fabMenu">${svg('<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 5h16v11H9l-5 4z"/>', 18)}<span>Contact</span></button>` : ""}
  ${waNum ? `<a class="fab-wa" href="${esc(waLink)}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${svg(ICONS.whatsapp, 28)}</a>` : ""}
</div>

<script src="js/main.js" defer></script>
</body>
</html>
`;
}
