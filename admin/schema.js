// Describes every editable part of the landing page, in page order.
// Field types: text, textarea, image, file, url, toggle, color, category, strings, group, items

export const SECTIONS = [
  {
    key: "hero", label: "Opening screen", icon: "★",
    help: "The first thing visitors see, next to the big book.",
    fields: [
      { key: "eyebrow", label: "Small line above the headline", type: "text" },
      { key: "titleStart", label: "Headline", type: "text" },
      { key: "titleHighlight", label: "Highlighted end of headline (coral italic)", type: "text" },
      { key: "text", label: "Intro paragraph", type: "textarea" },
      { key: "buttonMain", label: "Main button text", type: "text" },
      { key: "buttonSecond", label: "Second button text", type: "text" },
      { key: "proof", label: "Stat chips under the buttons (keep to 3 so they fit on one line)", type: "items", addLabel: "Add stat chip", title: i => `${i.big || ""} ${i.small || ""}`,
        newItem: () => ({ big: "", small: "" }),
        fields: [{ key: "big", label: "Big text", type: "text" }, { key: "small", label: "Small text", type: "text" }] },
      { key: "note", label: "Handwritten note next to the book", type: "text" }
    ]
  },
  {
    key: "book", label: "Scrolling book", icon: "📖",
    help: "The 3D book that floats behind the page. Upload the front, back and spine of the cover.",
    fields: [
      { key: "front", label: "Front cover", type: "image" },
      { key: "back", label: "Back cover", type: "image" },
      { key: "spine", label: "Spine", type: "image" },
      { key: "insideCoverLabel", label: "Inside cover: small label", type: "text" },
      { key: "insideCoverText", label: "Inside cover: handwritten line", type: "text" },
      { key: "page1Back", label: "Page text (left page, first turn)", type: "textarea" },
      { key: "page2Front", label: "Caption on the snowy page", type: "text" },
      { key: "page2Back", label: "Page text (left page, second turn)", type: "textarea" },
      { key: "lastPage", label: "Caption on the last page", type: "text" }
    ]
  },
  { key: "platforms", label: "Platform strip", icon: "↔", help: "The sliding strip of platform names under the opening screen.",
    list: { label: "Platforms", type: "strings", addLabel: "Add platform" } },
  {
    key: "problem", label: "Problems section", icon: "?",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Intro", type: "textarea" },
      { key: "items", label: "Problems", type: "items", addLabel: "Add problem", title: i => i.title,
        newItem: () => ({ title: "", text: "" }),
        fields: [{ key: "title", label: "The problem", type: "text" }, { key: "text", label: "How I fix it", type: "textarea" }] }
    ]
  },
  {
    key: "services", label: "Services", icon: "✎",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "main", label: "Main service", type: "group", fields: [
        { key: "tag", label: "Label", type: "text" },
        { key: "title", label: "Service name", type: "text" },
        { key: "text", label: "Description", type: "textarea" },
        { key: "points", label: "Bullet points", type: "strings", addLabel: "Add bullet" }
      ] },
      { key: "addons", label: "Add-on services", type: "items", addLabel: "Add service", title: i => i.title,
        newItem: () => ({ tag: "Add-on", title: "", text: "" }),
        fields: [{ key: "tag", label: "Label", type: "text" }, { key: "title", label: "Service name", type: "text" }, { key: "text", label: "Description", type: "textarea" }] },
      { key: "button", label: "Button text", type: "text" }
    ]
  },
  {
    key: "work", label: "Case studies", icon: "▦",
    help: "Your portfolio grid. Add a new book, change pictures and PDF links, or remove old ones.",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Intro", type: "textarea" },
      { key: "items", label: "Case studies", type: "items", addLabel: "Add case study", title: i => i.title, thumb: "image",
        newItem: () => ({ title: "", genre: "", category: "children", image: "", link: "", linkLabel: "View PDF" }),
        fields: [
          { key: "title", label: "Book title", type: "text" },
          { key: "genre", label: "Book type (shown above the title)", type: "text" },
          { key: "category", label: "Filter group", type: "category" },
          { key: "image", label: "Picture (wide, about 5:3)", type: "image" },
          { key: "link", label: "Case study PDF or link (leave empty to link to the quote form)", type: "file" },
          { key: "linkLabel", label: "Link text", type: "text" }
        ] },
      { key: "showFirst", label: "How many books to show before \"Show more\"", type: "text" },
      { key: "moreButton", label: "\"Show more\" button text", type: "text" },
      { key: "categories", label: "Book groups (shown as a small label on each book)", type: "items", addLabel: "Add group", title: i => i.label,
        newItem: () => ({ id: "", label: "" }),
        fields: [{ key: "label", label: "Button text", type: "text" }, { key: "id", label: "Short code (letters only, used to match case studies)", type: "text" }] },
      { key: "button", label: "Button under the grid", type: "text" }
    ]
  },
  {
    key: "process", label: "How it works", icon: "1",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "steps", label: "Steps (numbered automatically)", type: "items", addLabel: "Add step", title: i => i.title,
        newItem: () => ({ title: "", text: "" }),
        fields: [{ key: "title", label: "Step name", type: "text" }, { key: "text", label: "Description", type: "textarea" }] }
    ]
  },
  {
    key: "about", label: "About me", icon: "☺",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "photo", label: "Your photo (square works best)", type: "image" },
      { key: "photoLabel", label: "Handwritten line under the photo", type: "text" },
      { key: "paragraphs", label: "Paragraphs (put **two stars** around words to make them bold)", type: "strings", multiline: true, addLabel: "Add paragraph" },
      { key: "facts", label: "Quick-fact chips", type: "strings", addLabel: "Add fact" }
    ]
  },
  {
    key: "reviews", label: "Reviews", icon: "❝",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "featured", label: "Featured review (big card)", type: "group", fields: [
        { key: "show", label: "Show the featured review", type: "toggle" },
        { key: "badge", label: "Badge text", type: "text" },
        { key: "score", label: "Score (e.g. 5.0)", type: "text" },
        { key: "text", label: "Review text", type: "textarea" },
        { key: "ratings", label: "Rating bars", type: "items", addLabel: "Add rating", title: i => `${i.label || ""}: ${i.score || ""}`,
          newItem: () => ({ label: "", score: "5" }),
          fields: [{ key: "label", label: "Label", type: "text" }, { key: "score", label: "Score out of 5", type: "text" }] }
      ] },
      { key: "fiverrLabel", label: "\"Read all reviews\" button text (shows when your Fiverr link is set in Contact)", type: "text" },
      { key: "items", label: "More real reviews (cards under the featured review)", type: "items", addLabel: "Add review", title: i => i.name,
        newItem: () => ({ name: "", role: "", text: "", stars: "5", color: "#9b74ee" }),
        fields: [
          { key: "name", label: "Client name", type: "text" },
          { key: "role", label: "Who they are (e.g. Children's book author)", type: "text" },
          { key: "text", label: "Review", type: "textarea" },
          { key: "stars", label: "Stars (1 to 5)", type: "text" },
          { key: "color", label: "Circle colour", type: "color" }
        ] },
      { key: "button", label: "Button text", type: "text" }
    ]
  },
  {
    key: "packages", label: "Packages", icon: "$",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Intro", type: "textarea" },
      { key: "items", label: "Packages", type: "items", addLabel: "Add package", title: i => i.name,
        newItem: () => ({ name: "", price: "", for: "", features: [], highlight: false, badge: "", button: "Get a quote" }),
        fields: [
          { key: "name", label: "Package name", type: "text" },
          { key: "price", label: "Price (optional, e.g. From $250)", type: "text" },
          { key: "for", label: "Who it's for", type: "text" },
          { key: "features", label: "What's included", type: "strings", addLabel: "Add item" },
          { key: "highlight", label: "Highlight this package", type: "toggle" },
          { key: "badge", label: "Badge (e.g. Most chosen)", type: "text" },
          { key: "button", label: "Button text", type: "text" }
        ] },
      { key: "noteText", label: "Note under packages", type: "text" },
      { key: "noteLink", label: "Note link text", type: "text" }
    ]
  },
  {
    key: "promises", label: "Promises", icon: "✓",
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Promises", type: "items", addLabel: "Add promise", title: i => i.title,
        newItem: () => ({ icon: "★", title: "", text: "" }),
        fields: [{ key: "icon", label: "Icon (one character, e.g. ✓ ★ ✎ ©)", type: "text" }, { key: "title", label: "Title", type: "text" }, { key: "text", label: "Text", type: "textarea" }] }
    ]
  },
  {
    key: "faq", label: "FAQ", icon: "?",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Questions", type: "items", addLabel: "Add question", title: i => i.question,
        newItem: () => ({ question: "", answer: "" }),
        fields: [{ key: "question", label: "Question", type: "text" }, { key: "answer", label: "Answer", type: "textarea" }] }
    ]
  },
  {
    key: "quote", label: "Quote form", icon: "✉",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Intro", type: "textarea" },
      { key: "options", label: "Choices in \"What do you need?\"", type: "strings", addLabel: "Add choice" },
      { key: "button", label: "Send button text", type: "text" }
    ]
  },
  {
    key: "lastCall", label: "Final call to action", icon: "➜",
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "text", label: "Text", type: "textarea" },
      { key: "buttonMain", label: "WhatsApp button text", type: "text" },
      { key: "buttonSecond", label: "Second button text", type: "text" },
      { key: "points", label: "Tick points", type: "strings", addLabel: "Add point" }
    ]
  },
  {
    key: "footer", label: "Footer", icon: "▁",
    fields: [
      { key: "text", label: "Short description", type: "textarea" },
      { key: "services", label: "Services list", type: "strings", addLabel: "Add service" },
      { key: "note", label: "Small note under contact", type: "text" }
    ]
  },
  {
    key: "contact", label: "Contact & social", icon: "☎",
    help: "Used everywhere on the page: buttons, footer, quote form and Google details. Leave a social link empty to hide it.",
    fields: [
      { key: "whatsapp", label: "WhatsApp number (digits with country code, e.g. 2349067759138)", type: "text" },
      { key: "whatsappDisplay", label: "WhatsApp number as shown on the page", type: "text" },
      { key: "whatsappMessage", label: "First message when someone taps WhatsApp", type: "text" },
      { key: "email", label: "Email address", type: "text" },
      { key: "upwork", label: "Upwork link", type: "url" },
      { key: "instagram", label: "Instagram link", type: "url" },
      { key: "threads", label: "Threads link", type: "url" },
      { key: "linkedin", label: "LinkedIn link", type: "url" },
      { key: "tiktok", label: "TikTok link", type: "url" },
      { key: "fiverr", label: "Fiverr profile link (adds \"Read all reviews on Fiverr\")", type: "url" }
    ]
  },
  {
    key: "brand", label: "Brand", icon: "B",
    fields: [
      { key: "first", label: "Brand name, first word", type: "text" },
      { key: "second", label: "Brand name, purple part", type: "text" },
      { key: "ownerName", label: "Your full name", type: "text" },
      { key: "ownerTitle", label: "Your job title", type: "text" },
      { key: "tagline", label: "Tagline on the opening animation", type: "text" }    ]
  },
  {
    key: "nav", label: "Top menu", icon: "≡",
    fields: [{ key: "button", label: "Button in the top menu", type: "text" }]
  },
  {
    key: "seo", label: "Google & sharing", icon: "G",
    help: "How your site appears on Google and when the link is shared on WhatsApp or social media.",
    fields: [
      { key: "title", label: "Page title on Google (about 60 characters)", type: "text", counter: 60 },
      { key: "description", label: "Description on Google (about 155 characters)", type: "textarea", counter: 155 },
      { key: "keywords", label: "Keywords (comma separated)", type: "textarea" },
      { key: "shareImage", label: "Picture shown when the link is shared", type: "image" },
      { key: "siteUrl", label: "Your website address (e.g. https://blessedkdpdesignzz.com)", type: "url" }
    ]
  }
];
