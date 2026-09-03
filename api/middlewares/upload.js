// middlewares/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads/news");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `news-${uniqueSuffix}${ext}`);
  },
});

const mediaFileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/avi",
    "video/quicktime", // mov
    "video/webm",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Type de fichier non autorisé. Images/vidéos seulement."));
};

const imageOnlyFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith("image/")) {
    return cb(null, true);
  }

  cb(new Error("Images seulement."));
};

export const uploadNewsMedia = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
}).single("image");

export const uploadNewsImages = multer({
  storage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
}).single("image");