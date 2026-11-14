// Shared helpers for the admin API (files starting with "_" are not public routes).
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "bk_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

export const env = name => {
  const v = process.env[name];
  if (!v) throw Object.assign(new Error(`Missing setting ${name} in Vercel`), { status: 500 });
  return v;
};

const b64url = buf => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const sign = data => b64url(createHmac("sha256", env("ADMIN_SECRET")).update(data).digest());

export function makeToken() {
  const payload = b64url(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 }));
  return `${payload}.${sign(payload)}`;
}

export function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  if (x.length !== y.length) { timingSafeEqual(x, x); return false; }
  return timingSafeEqual(x, y);
}

function readCookie(req, name) {
  const raw = req.headers.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > -1 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return "";
}

export function isAuthed(req) {
  try {
    const tok = readCookie(req, COOKIE);
    const [payload, sig] = tok.split(".");
    if (!payload || !sig || !safeEqual(sig, sign(payload))) return false;
    const { exp } = JSON.parse(Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch { return false; }
}

export const setSession = res =>
  res.setHeader("Set-Cookie", `${COOKIE}=${makeToken()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`);
export const clearSession = res =>
  res.setHeader("Set-Cookie", `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`);

// Block requests coming from other websites
export function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch { return false; }
}

export function guard(req, res, methods) {
  res.setHeader("Cache-Control", "no-store");
  if (!methods.includes(req.method)) { res.status(405).json({ error: "Method not allowed" }); return false; }
  if (req.method !== "GET" && !sameOrigin(req)) { res.status(403).json({ error: "Blocked" }); return false; }
  if (!isAuthed(req)) { res.status(401).json({ error: "Please log in again." }); return false; }
  return true;
}

/* ---------- GitHub storage ---------- */
const GH = "https://api.github.com";
const ghHeaders = () => ({
  Authorization: `Bearer ${env("GITHUB_TOKEN")}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "site-cms"
});
const repo = () => env("GITHUB_REPO").replace(/^https:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
const branch = () => process.env.GITHUB_BRANCH || "main";
const encPath = p => p.split("/").map(encodeURIComponent).join("/");

export async function ghGet(path) {
  const r = await fetch(`${GH}/repos/${repo()}/contents/${encPath(path)}?ref=${encodeURIComponent(branch())}`, { headers: ghHeaders() });
  if (r.status === 404) return null;
  if (!r.ok) throw Object.assign(new Error(`GitHub said ${r.status}: ${(await r.text()).slice(0, 200)}`), { status: 502 });
  return r.json();
}

export async function ghPut(path, base64, message, sha) {
  const r = await fetch(`${GH}/repos/${repo()}/contents/${encPath(path)}`, {
    method: "PUT",
    headers: { ...ghHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ message, content: base64, branch: branch(), ...(sha ? { sha } : {}) })
  });
  if (r.status === 409 || r.status === 422) {
    throw Object.assign(new Error("The content changed somewhere else. Reload the admin page and try again."), { status: 409 });
  }
  if (!r.ok) throw Object.assign(new Error(`GitHub said ${r.status}: ${(await r.text()).slice(0, 200)}`), { status: 502 });
  return r.json();
}

export function fail(res, err) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
}
