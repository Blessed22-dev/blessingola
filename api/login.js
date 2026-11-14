import { env, safeEqual, setSession, clearSession, isAuthed, sameOrigin, fail } from "./_lib.js";

const wait = ms => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") return res.status(200).json({ loggedIn: isAuthed(req) });
    if (req.method === "DELETE") { clearSession(res); return res.status(200).json({ ok: true }); }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    if (!sameOrigin(req)) return res.status(403).json({ error: "Blocked" });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const okUser = safeEqual(String(body.username || "").trim().toLowerCase(), env("ADMIN_USERNAME").trim().toLowerCase());
    const okPass = safeEqual(String(body.password || ""), env("ADMIN_PASSWORD"));
    if (!okUser || !okPass) {
      await wait(900); // slows down password guessing
      return res.status(401).json({ error: "Wrong username or password." });
    }
    setSession(res);
    return res.status(200).json({ ok: true });
  } catch (err) { fail(res, err); }
}
