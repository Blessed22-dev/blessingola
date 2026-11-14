// Vercel runs this on every deploy: content/content.json -> dist/index.html
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from "node:fs";
import { renderPage } from "./lib/render.mjs";

const OUT = "dist";
const content = JSON.parse(readFileSync("content/content.json", "utf8"));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const dir of ["css", "js", "img", "admin", "lib", "content"]) {
  if (existsSync(dir)) cpSync(dir, `${OUT}/${dir}`, { recursive: true });
}
if (existsSync("robots.txt")) cpSync("robots.txt", `${OUT}/robots.txt`);

writeFileSync(`${OUT}/index.html`, renderPage(content));

const site = (content.seo && content.seo.siteUrl || "").replace(/\/$/, "");
if (site) {
  writeFileSync(`${OUT}/sitemap.xml`,
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod></url>\n</urlset>\n`);
  writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: ${site}/sitemap.xml\n`);
}

console.log("Built", `${OUT}/index.html`);
