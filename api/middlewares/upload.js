import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/news/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'news-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Autoriser images et vidéos
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|avi|mov|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé. Images/vidéos seulement.'), false);
  }
};

const limits = {
  fileSize: 50 * 1024 * 1024 // 50MB max
};

export const uploadNewsMedia = multer({ 
  storage, 
  fileFilter, 
  limits 
}).single('media');

export const uploadNewsImages = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    if (imageTypes.test(file.mimetype)) cb(null, true);
    else cb(new Error('Images seulement'), false);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB images
});
