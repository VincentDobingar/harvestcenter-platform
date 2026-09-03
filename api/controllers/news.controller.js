// controllers/news.controller.js
import db from "../config/db.js";

export const listPublicNews = async (req, res) => {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        content,
        excerpt,
        image_url,
        video_url,
        media_type,
        is_active,
        created_at,
        updated_at
      FROM news
      WHERE is_active = 1
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [limit]
    );

    return res.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("listPublicNews error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des actualités.",
    });
  }
};

export const getPublicNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        content,
        excerpt,
        image_url,
        video_url,
        media_type,
        is_active,
        created_at,
        updated_at
      FROM news
      WHERE slug = ? AND is_active = 1
      LIMIT 1
      `,
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Actualité introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getPublicNewsBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l'actualité.",
    });
  }
};

export const getPublicNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        slug,
        content,
        excerpt,
        image_url,
        video_url,
        media_type,
        is_active,
        created_at,
        updated_at
      FROM news
      WHERE id = ? AND is_active = 1
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Actualité introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getPublicNewsById error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l'actualité.",
    });
  }
};