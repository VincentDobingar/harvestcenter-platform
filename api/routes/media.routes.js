import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEDIA_DIR = path.join(__dirname, "../../media");

router.get("/", (req, res) => {
  try {
    const limit = Number(req.query.limit) || 8;
    const offset = Number(req.query.offset) || 0;

    if (!fs.existsSync(MEDIA_DIR)) {
      return res.json({ success: true, media: [] });
    }

    const files = fs.readdirSync(MEDIA_DIR);

    const sorted = files.sort((a, b) => {
      const aTime = fs.statSync(path.join(MEDIA_DIR, a)).mtime.getTime();
      const bTime = fs.statSync(path.join(MEDIA_DIR, b)).mtime.getTime();
      return bTime - aTime;
    });

    const pagedFiles = sorted.slice(offset, offset + limit);

    const baseUrl = `${req.protocol}://${req.get("host")}/media`;

    const media = pagedFiles.map(file => ({
      id: file,
      filename: file,
      url: `${baseUrl}/${encodeURIComponent(file)}`,
      type: file.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image"
    }));

    res.json({ success: true, media });

  } catch (error) {
    console.error("Erreur media:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;