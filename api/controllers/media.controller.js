import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

// MEDIA DIRECTORY (adaptez selon votre structure)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_DIR = path.join(__dirname, "../public/media"); // ou "../uploads/media"

// GET /api/media?limit=8&page=1
export const getMediaList = async (req, res) => {
  try {
    const { limit = 8, page = 1, search = "" } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const offset = (pageNum - 1) * limitNum;

    // Lire tous les fichiers média (jpg, png, mp4, etc.)
    const files = await fs.readdir(MEDIA_DIR).catch(() => []);
    
    // Filtrer les fichiers média
    const mediaFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif|mp4|webm|mov|avi)$/i.test(file))
      .filter(file => !search || file.toLowerCase().includes(search.toLowerCase()))
      .map(file => {
        const stats = fs.statSync(path.join(MEDIA_DIR, file));
        return {
          id: path.parse(file).name,
          filename: file,
          url: `/media/${file}`, // Accessible via public/media/
          size: stats.size,
          mimeType: file.split('.').pop(),
          uploadedAt: stats.mtime,
          fullPath: path.join(MEDIA_DIR, file)
        };
      });

    // Pagination
    const total = mediaFiles.length;
    const media = mediaFiles.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: media,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    console.error("[MEDIA] Error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des médias"
    });
  }
};

// POST /api/media/upload (MULTIPLE)
export const uploadMedia = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier reçu"
      });
    }

    const uploaded = [];
    for (const file of req.files) {
      const filename = `${Date.now()}-${file.name}`;
      const filepath = path.join(MEDIA_DIR, filename);
      
      await fs.writeFile(filepath, file.data);
      uploaded.push({
        filename,
        url: `/media/${filename}`,
        size: file.data.length,
        mimeType: file.mimetype
      });
    }

    res.json({
      success: true,
      data: uploaded,
      message: `${uploaded.length} fichier(s) uploadé(s)`
    });

  } catch (error) {
    console.error("[MEDIA UPLOAD] Error:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'upload"
    });
  }
};

// DELETE /api/media/:id
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const filename = `${id}`;
    const filepath = path.join(MEDIA_DIR, filename);

    await fs.unlink(filepath);
    
    res.json({
      success: true,
      message: "Média supprimé"
    });

  } catch (error) {
    console.error("[MEDIA DELETE] Error:", error);
    res.status(404).json({
      success: false,
      message: "Média non trouvé"
    });
  }
};
