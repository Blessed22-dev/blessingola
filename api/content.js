import { guard, ghGet, ghPut, fail } from "./_lib.js";

const PATH = "content/content.json";

export default async function handler(req, res) {
  if (!guard(req, res, ["GET", "PUT"])) return;
  try {
    if (req.method === "GET") {
      const file = await ghGet(PATH);
      if (!file) return res.status(404).json({ error: "content/content.json is missing from GitHub." });
      const text = Buffer.from(file.content, "base64").toString("utf8");
      return res.status(200).json({ content: JSON.parse(text), sha: file.sha });
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const content = body.content;
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return res.status(400).json({ error: "Nothing to save." });
    }
    const text = JSON.stringify(content, null, 2) + "\n";
    if (text.length > 900_000) return res.status(413).json({ error: "The content is too large to save." });

    const result = await ghPut(PATH, Buffer.from(text, "utf8").toString("base64"),
      body.message || "Update website content from admin", body.sha);
    return res.status(200).json({ ok: true, sha: result.content.sha });
  } catch (err) { fail(res, err); }
}
