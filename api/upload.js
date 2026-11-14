import { guard, ghGet, ghPut, fail } from "./_lib.js";

export const config = { api: { bodyParser: { sizeLimit: "4mb" } } };

const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

export default async function handler(req, res) {
  if (!guard(req, res, ["POST"])) return;
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const ext = TYPES[body.type];
    if (!ext) return res.status(400).json({ error: "Only JPG, PNG, WebP images or PDF files can be uploaded." });
    const data = String(body.data || "").replace(/^data:[^,]+,/, "");
    if (!data) return res.status(400).json({ error: "The file was empty." });
    if (data.length > 4_000_000) return res.status(413).json({ error: "That file is too big. Please use one under 3 MB." });

    const base = String(body.name || "file").toLowerCase()
      .replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
    const folder = ext === "pdf" ? "img/uploads/files" : "img/uploads";
    const path = `${folder}/${Date.now().toString(36)}-${base}.${ext}`;

    const exists = await ghGet(path);
    await ghPut(path, data, `Upload ${path} from admin`, exists && exists.sha);
    return res.status(200).json({ ok: true, path });
  } catch (err) { fail(res, err); }
}
