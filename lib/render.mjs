// Builds the full landing page HTML from content/content.json.
// Used by build.mjs on Vercel (Node) and by the admin's live preview (browser).

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

const ICONS = {
  instagram: '<path fill="currentColor" d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3Zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0ZM21.4 8.2c-.1-1.5-.4-2.8-1.5-3.9s-2.4-1.4-3.9-1.5C14.5 2.7 9.5 2.7 7.9 2.8c-1.5.1-2.8.4-3.9 1.5S2.6 6.7 2.5 8.2c-.1 1.6-.1 6.6 0 8.2.1 1.5.4 2.8 1.5 3.9s2.4 1.4 3.9 1.5c1.6.1 6.6.1 8.2 0 1.5-.1 2.8-.4 3.9-1.5s1.4-2.4 1.5-3.9c.1-1.6.1-6.6 0-8.2Zm-2.1 9.9a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.3.4-5.6.4s-4.4.1-5.6-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.3-.4-5.6s-.1-4.4.4-5.6a3.2 3.2 0 0 1 1.8-1.8c1.3-.5 4.3-.4 5.6-.4s4.4-.1 5.6.4a3.2 3.2 0 0 1 1.8 1.8c.5 1.3.4 4.3.4 5.6s.1 4.4-.4 5.6Z"/>',
  threads: '<path fill="currentColor" d="M16.7 11.2c-.1 0-.2-.1-.3-.1-.2-3-1.8-4.7-4.6-4.7-1.6 0-3 .7-3.9 2l1.5 1c.6-.9 1.6-1.1 2.4-1.1 1.4 0 2.4.5 2.7 2.2a10 10 0 0 0-2.4-.1c-2.4.1-4 1.6-3.9 3.5.1 2 1.9 3.2 4 3.1 1.6-.1 3.3-1 3.7-3.6.7.4 1.2 1 1.4 1.6.4 1 .5 2.6-.8 3.9-1.1 1.1-2.5 1.6-4.5 1.6-2.3 0-4-.7-5.100-2.2-1-1.3-1.6-3.2-1.6-5.6s.5-4.3 1.6-5.6C8 5.6 9.7 4.9 12 4.9c2.3 0 4 .7 5.2 2.2.6.7 1 1.6 1.3 2.6l1.8-.5c-.3-1.3-.9-2.4-1.6-3.3C17.2 4 15 3.1 12 3.1 9.1 3.1 7 4 5.6 5.8 4.3 7.4 3.7 9.6 3.6 12.5c0 2.9.7 5.1 2 6.7 1.4 1.8 3.5 2.7 6.4 2.7 2.5 0 4.2-.7 5.7-2.1 1.9-1.9 1.8-4.3 1.2-5.8-.4-1.1-1.2-2-2.2-2.8Zm-4.6 4.6c-1 .1-2-.4-2.1-1.3 0-.7.5-1.5 2.1-1.6h.5c.6 0 1.2.1 1.7.2-.2 2.2-1.2 2.6-2.2 2.7Z"/>',
  linkedin: '<path fill="currentColor" d="M6.9 8.6H3.4V20h3.5V8.6ZM5.2 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM20.6 13.7c0-3.1-.7-5.4-4.3-5.4-1.7 0-2.9.9-3.3 1.8V8.6H9.6V20h3.5v-5.6c0-1.5.3-2.9 2.1-2.9s1.8 1.7 1.8 3V20h3.6v-6.3Z"/>',
  upwork: '<path fill="currentColor" d="M17.5 6.6c-2.3 0-4 1.5-4.7 3.9-1.1-1.6-1.900-3.6-2.4-5.3H8v6.5a2.4 2.4 0 1 1-4.8 0V5.2H.9v6.5a4.7 4.7 0 0 0 9.4 0v-1.1c.5 1 1 2 1.7 2.9l-1.5 7h2.4l1.1-5c1 .6 2.1 1 3.4 1a4.9 4.9 0 0 0 0-9.9Zm0 7.6c-1 0-2-.4-2.8-1.1l.2-1c.2-1.2.9-3.1 2.6-3.1a2.6 2.6 0 0 1 0 5.2Z"/>',
  tiktok: '<path fill="currentColor" d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.8a5.7 5.7 0 1 0 4.9 5.6V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6Z"/>'
};
const WA_ICON = '<path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.500-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/>';

const MAIL_ICON = '<path fill="currentColor" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2.4V17h16V7.4l-7.4 5.2a1 1 0 0 1-1.2 0L4 7.4ZM5.6 7l6.4 4.5L18.4 7H5.6Z"/>';

const SOCIALS = [
  ["instagram", "Instagram"], ["threads", "Threads"], ["linkedin", "LinkedIn"], ["upwork", "Upwork"], ["tiktok", "TikTok"]
];

const starsOf = n => {
  const k = Math.max(0, Math.min(5, Math.round(Number(n) || 5)));
  return "★".repeat(k) + "☆".repeat(5 - k);
};

export function renderPage(c, opts = {}) {
  c = c || {};
  const seo = c.seo || {}, brand = c.brand || {}, ct = c.contact || {};
  const hero = c.hero || {}, book = c.book || {}, prob = c.problem || {}, svc = c.services || {};
  const work = c.work || {}, proc = c.process || {}, about = c.about || {}, rev = c.reviews || {};
  const pk = c.packages || {}, prom = c.promises || {}, faq = c.faq || {}, qt = c.quote || {};
  const last = c.lastCall || {}, foot = c.footer || {};
  const brandName = `${brand.first || ""} ${brand.second || ""}`.trim();
  const logo = `<span class="logo-star" aria-hidden="true">★</span><span>${esc(brand.first)} <b>${esc(brand.second)}</b></span>`;
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

  const reviewCard = (r, hidden) => `
        <figure class="rev-card glass"${hidden ? ' aria-hidden="true"' : ""}>
          <span class="stars"${hidden ? "" : ` aria-label="${esc(Math.round(Number(r.stars) || 5))} out of 5 stars"`}>${starsOf(r.stars)}</span>
          <blockquote>“${esc(r.text)}”</blockquote>
          <figcaption><span class="avatar" style="--a:${esc(/^#[0-9a-f]{3,8}$/i.test(r.color || "") ? r.color : "#9b74ee")}">${esc((r.name || "?").trim().charAt(0).toUpperCase())}</span><span><b>${esc(r.name)}</b><small>${esc(r.role)}</small></span></figcaption>
        </figure>`;
  const revItems = list(rev.items);
  // repeat cards so the sliding row always fills the screen
  let loop = revItems.slice();
  while (loop.length && loop.length < 6) loop = loop.concat(revItems);

  const cats = list(work.categories);
  const items = list(work.items);

  // opener: each letter fades in one after another
  let li = 0;
  const letters = (word, cls) => [...String(word || "")].map(ch =>
    `<span${cls ? ` class="${cls}"` : ""} style="animation-delay:${(0.25 + (li++) * 0.045).toFixed(3)}s">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");

  // floating contact links on the right edge
  const floatLinks = [
    waNum && { cls: "wa", href: waLink, label: "Chat on WhatsApp", color: "#25d366", icon: WA_ICON },
    ct.email && { cls: "", href: `mailto:${ct.email}`, label: "Send an email", color: "#ea4335", icon: MAIL_ICON },
    safeUrl(ct.instagram) && { cls: "", href: ct.instagram, label: "Instagram", color: "#d62976", icon: ICONS.instagram },
    safeUrl(ct.linkedin) && { cls: "", href: ct.linkedin, label: "LinkedIn", color: "#0a66c2", icon: ICONS.linkedin },
    safeUrl(ct.upwork) && { cls: "", href: ct.upwork, label: "Hire me on Upwork", color: "#14a800", icon: ICONS.upwork },
    safeUrl(ct.threads) && { cls: "", href: ct.threads, label: "Threads", color: "#16130f", icon: ICONS.threads },
    safeUrl(ct.tiktok) && { cls: "", href: ct.tiktok, label: "TikTok", color: "#111111", icon: ICONS.tiktok }
  ].filter(Boolean);

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
<meta name="theme-color" content="#16130f">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%23ffc94a'/%3E%3Ctext x='16' y='22' font-size='18' text-anchor='middle' fill='%232b1650'%3E%E2%98%85%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Caveat:wght@600&display=swap">
<link rel="stylesheet" href="css/styles.css">
<script type="application/ld+json">${ld(jsonLd)}</script>
${faqLd.mainEntity.length ? `<script type="application/ld+json">${ld(faqLd)}</script>\n` : ""}</head>
<body class="is-opening">

<div class="opener" id="opener" aria-hidden="true">
  <div class="op-in">
    <span class="op-mark">★</span>
    <div class="op-name">${letters(brand.first, "")}<span>&nbsp;</span>${letters(brand.second, "gold")}</div>
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
      <a href="#work">Work</a>
      <a href="#process">Process</a>
      <a href="#reviews">Reviews</a>
      <a href="#packages">Packages</a>
      <a href="#faq">FAQ</a>
    </nav>
    <a class="btn btn-gold btn-sm" href="#quote">${esc(c.nav?.button || "Get a quote")}</a>
  </div>
</header>


<main id="main">

  <section class="sec hero" data-pose="hero" aria-labelledby="h1">
    <div class="wrap hero-grid">
      <div class="col-copy">
        <p class="eyebrow"><span>★</span> ${esc(hero.eyebrow)}</p>
        <h1 id="h1">${esc(hero.titleStart)} <em>${esc(hero.titleHighlight)}</em></h1>
        <p class="lede">${esc(hero.text)}</p>
        <div class="cta-row">
          <a class="btn btn-gold" href="#quote">${esc(hero.buttonMain)} <span aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="#work">${esc(hero.buttonSecond)}</a>
        </div>
        <ul class="hero-proof">
${list(hero.proof).map(p => `          <li><b>${esc(p.big)}</b> ${esc(p.small)}</li>`).join("\n")}
        </ul>
      </div>
      <div class="col-visual" id="heroVisual">
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
    <div class="scroll-cue" aria-hidden="true"><span></span>${esc(hero.scrollHint)}</div>
  </section>

  <div class="strip" aria-label="Platforms my files are prepared for">
    <div class="strip-track">
      ${list(c.platforms).map(p => `<span>${esc(p)}</span>`).join("")}
      ${list(c.platforms).map(p => `<span aria-hidden="true">${esc(p)}</span>`).join("")}
    </div>
  </div>

  <section class="sec" data-pose="tilt" aria-labelledby="h-problem">
    <div class="wrap">
      <div class="col-copy glass">
        <p class="eyebrow">${esc(prob.eyebrow)}</p>
        <h2 id="h-problem">${esc(prob.title)}</h2>
        <p class="lede">${esc(prob.text)}</p>
        <ul class="pains">
${list(prob.items).map(i => `          <li><strong>${esc(i.title)}</strong> ${esc(i.text)}</li>`).join("\n")}
        </ul>
      </div>
    </div>
  </section>

  <section class="sec" id="services" data-pose="open" aria-labelledby="h-services">
    <div class="wrap">
      <div class="col-copy glass">
        <p class="eyebrow">${esc(svc.eyebrow)}</p>
        <h2 id="h-services">${esc(svc.title)}</h2>
        <article class="svc svc-main">
          <span class="svc-tag">${esc(svc.main?.tag)}</span>
          <h3>${esc(svc.main?.title)}</h3>
          <p>${esc(svc.main?.text)}</p>
          <ul class="ticks">
${list(svc.main?.points).map(p => `            <li>${esc(p)}</li>`).join("\n")}
          </ul>
        </article>
        <div class="svc-row">
${list(svc.addons).map(a => `          <article class="svc">
            <span class="svc-tag svc-tag-alt">${esc(a.tag)}</span>
            <h3>${esc(a.title)}</h3>
            <p>${esc(a.text)}</p>
          </article>`).join("\n")}
        </div>
        <a class="btn btn-gold" href="#quote">${esc(svc.button)} <span aria-hidden="true">→</span></a>
      </div>
    </div>
  </section>

  <section class="sec showcase" id="work" data-pose="hide" aria-labelledby="h-work">
    <div class="wrap">
      <div class="show-head">
        <div>
          <p class="eyebrow">${esc(work.eyebrow)}</p>
          <h2 id="h-work">${esc(work.title)}</h2>
        </div>
        <p class="show-sub">${esc(work.text)}</p>
      </div>
      <div class="filters" role="group" aria-label="Filter books">
        <button class="filter" data-filter="all" aria-pressed="true">All</button>
${cats.map(k => `        <button class="filter" data-filter="${esc(k.id)}" aria-pressed="false">${esc(k.label)}</button>`).join("\n")}
      </div>
      <div class="case-grid" id="caseGrid">
${items.map(it => {
    const href = safeUrl(it.link);
    return `        <article class="case glass" data-cat="${esc(it.category)}">
          <div class="case-img"><img src="${esc(safeUrl(it.image))}" alt="${esc(it.title)}, ${esc(it.genre)}" loading="lazy" width="1000" height="600"></div>
          <div class="case-body">
            <p class="case-kicker">Case study</p>
            <p class="case-genre">${esc(it.genre)}</p>
            <h3>${esc(it.title)}</h3>
            <a class="case-link" href="${esc(href || "#quote")}"${ext(href)}>${esc(it.linkLabel || (href ? "View PDF" : "Start a book like this"))} <span aria-hidden="true">→</span></a>
          </div>
        </article>`;
  }).join("\n")}
      </div>
      <div class="rev-cta"><a class="btn btn-gold" href="#quote">${esc(work.button)} <span aria-hidden="true">→</span></a></div>
    </div>
  </section>

  <section class="sec" id="process" data-pose="spine" aria-labelledby="h-process">
    <div class="wrap">
      <div class="col-copy glass">
        <p class="eyebrow">${esc(proc.eyebrow)}</p>
        <h2 id="h-process">${esc(proc.title)}</h2>
        <ol class="steps">
${list(proc.steps).map((s, i) => `          <li><span class="step-n">${i + 1}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></div></li>`).join("\n")}
        </ol>
      </div>
    </div>
  </section>

  <section class="sec about" id="about" data-pose="back" aria-labelledby="h-about">
    <div class="wrap about-grid">
      <figure class="about-photo">
        <img src="${esc(safeUrl(about.photo))}" alt="${esc(brand.ownerName)}, ${esc(brand.ownerTitle)}" width="800" height="800" loading="lazy">
        ${about.photoLabel ? `<figcaption><span class="hand">${esc(about.photoLabel)}</span></figcaption>` : ""}
      </figure>
      <div class="about-copy glass">
        <p class="eyebrow">${esc(about.eyebrow)}</p>
        <h2 id="h-about">${esc(about.title)}</h2>
${list(about.paragraphs).map(p => `        <p>${rich(p)}</p>`).join("\n")}
        <div class="socials" aria-label="Find me online">
${socials.map(([k, label]) => `          <a href="${esc(ct[k])}" target="_blank" rel="noopener">${label}</a>`).join("\n")}
        </div>
      </div>
    </div>
  </section>

  <section class="sec reviews" id="reviews" data-pose="hide" aria-labelledby="h-reviews">
    <div class="wrap">
      <div class="center-head">
        <p class="eyebrow">${esc(rev.eyebrow)}</p>
        <h2 id="h-reviews">${esc(rev.title)}</h2>
      </div>
${rev.featured && rev.featured.show !== false ? `      <div class="rev-feature glass">
        <div class="rev-main">
          <p class="rev-badge"><span class="rev-check" aria-hidden="true">✓</span> ${esc(rev.featured.badge)}</p>
          <p class="rev-score"><span class="stars" aria-label="${esc(rev.featured.score)} out of 5 stars">${starsOf(rev.featured.score)}</span> <b>${esc(rev.featured.score)}</b></p>
          <blockquote class="rev-big">“${esc(rev.featured.text)}”</blockquote>
        </div>
        <dl class="rev-bars">
${list(rev.featured.ratings).map(r => `          <div><dt>${esc(r.label)}</dt><dd><span class="bar"><i style="width:${Math.max(0, Math.min(100, (Number(r.score) || 0) * 20))}%"></i></span><b>${esc(r.score)}</b></dd></div>`).join("\n")}
        </dl>
      </div>` : ""}
    </div>
${revItems.length ? `    <div class="rev-marquee" aria-label="More client reviews">
      <div class="rev-track">${loop.map((r, i) => reviewCard(r, i >= revItems.length)).join("")}${loop.map(r => reviewCard(r, true)).join("")}
      </div>
    </div>` : ""}
    <div class="wrap rev-cta">
      <a class="btn btn-gold" href="#quote">${esc(rev.button)} <span aria-hidden="true">→</span></a>
    </div>
  </section>

  <section class="sec packages" id="packages" data-pose="hide" aria-labelledby="h-packages">
    <div class="wrap">
      <div class="center-head">
        <p class="eyebrow">${esc(pk.eyebrow)}</p>
        <h2 id="h-packages">${esc(pk.title)}</h2>
        <p class="lede">${esc(pk.text)}</p>
      </div>
      <div class="pkg-grid">
${list(pk.items).map(p => `        <article class="pkg glass${p.highlight ? " pkg-hot" : ""}">
          ${p.badge ? `<span class="pkg-badge">${esc(p.badge)}</span>` : ""}
          <h3>${esc(p.name)}</h3>
          ${p.price ? `<p class="pkg-price">${esc(p.price)}</p>` : ""}
          <p class="pkg-for">${esc(p.for)}</p>
          <ul class="ticks">
${list(p.features).map(f => `            <li>${esc(f)}</li>`).join("\n")}
          </ul>
          <a class="btn ${p.highlight ? "btn-gold" : "btn-ghost"}" href="#quote" data-pkg="${esc(p.name)}">${esc(p.button || "Get a quote")}</a>
        </article>`).join("\n")}
      </div>
      ${pk.noteText || pk.noteLink ? `<p class="pkg-note">${esc(pk.noteText)} <a href="#quote" data-pkg="Cover or formatting only">${esc(pk.noteLink)}</a>.</p>` : ""}
    </div>
  </section>

  <section class="sec promises" data-pose="hide" aria-labelledby="h-promise">
    <div class="wrap">
      <h2 id="h-promise" class="center-head">${esc(prom.title)}</h2>
      <div class="promise-grid">
${list(prom.items).map(p => `        <div class="promise glass"><span class="p-ico" aria-hidden="true">${esc(p.icon || "★")}</span><h3>${esc(p.title)}</h3><p>${esc(p.text)}</p></div>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="sec faq" id="faq" data-pose="back" aria-labelledby="h-faq">
    <div class="wrap faq-wrap">
      <div class="center-head">
        <p class="eyebrow">${esc(faq.eyebrow)}</p>
        <h2 id="h-faq">${esc(faq.title)}</h2>
      </div>
      <div class="faq-list">
${list(faq.items).map(f => `        <details class="glass"><summary>${esc(f.question)}</summary><p>${esc(f.answer)}</p></details>`).join("\n")}
      </div>
    </div>
  </section>

  <section class="sec final" id="quote" data-pose="final" aria-labelledby="h-quote">
    <div class="wrap">
      <div class="col-copy glass">
        <p class="eyebrow">${esc(qt.eyebrow)}</p>
        <h2 id="h-quote">${esc(qt.title)}</h2>
        <p class="lede">${esc(qt.text)}</p>
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
            <textarea id="qStory" name="story" rows="3" required placeholder="Who is the main character, and what happens?"></textarea>
          </div>
          <p class="f-error" id="qError" hidden>Please add your name and a line about your story.</p>
          <button class="btn btn-gold btn-wide" type="submit">${esc(qt.button)} <span aria-hidden="true">→</span></button>
        </form>
        <div class="contact-alt">
          ${ct.email ? `<p>Prefer email? <a href="mailto:${esc(ct.email)}">${esc(ct.email)}</a></p>` : ""}
          ${safeUrl(ct.upwork) ? `<p>Prefer a platform? <a href="${esc(ct.upwork)}" target="_blank" rel="noopener">Hire me on Upwork</a></p>` : ""}
        </div>
      </div>
    </div>
  </section>

  <section class="sec last-call" data-pose="hide" aria-labelledby="h-last">
    <div class="wrap">
      <div class="last-box">
        <span class="last-star" aria-hidden="true">★</span>
        <p class="eyebrow">${esc(last.eyebrow)}</p>
        <h2 id="h-last">${esc(last.title)}</h2>
        <p class="lede">${esc(last.text)}</p>
        <div class="cta-row">
          <a class="btn btn-gold" href="${esc(waLink)}"${ext(waLink)}>${esc(last.buttonMain)} <span aria-hidden="true">→</span></a>
          <a class="btn btn-ghost" href="#quote">${esc(last.buttonSecond)}</a>
        </div>
        <ul class="last-points">
${list(last.points).map(p => `          <li>${esc(p)}</li>`).join("\n")}
        </ul>
      </div>
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
${socials.map(([k, label]) => `          <a href="${esc(ct[k])}" target="_blank" rel="noopener" aria-label="${label}"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${ICONS[k]}</svg></a>`).join("\n")}
        </div>
      </div>
      <nav class="foot-col" aria-label="Services">
        <h3>Services</h3>
${list(foot.services).map(s => `        <a href="#services">${esc(s)}</a>`).join("\n")}
      </nav>
      <nav class="foot-col" aria-label="Quick links">
        <h3>Quick links</h3>
        <a href="#work">Portfolio</a>
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
      <a href="#top" class="to-top">Back to top ↑</a>
    </div>
  </div>
</footer>

${floatLinks.length ? `<ul class="float-links" aria-label="Contact me">
${floatLinks.map(f => `  <li><a class="${f.cls}" href="${esc(f.href)}"${ext(f.href)} style="--c:${f.color}" aria-label="${esc(f.label)}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">${f.icon}</svg><span class="tip">${esc(f.label)}</span></a></li>`).join("\n")}
</ul>` : ""}

<canvas class="sky" id="sky" aria-hidden="true"></canvas>
<script src="js/main.js"></script>
</body>
</html>
`;
}
