// controllers/news.controller.js
import db from "../config/db.js";
import { buildNewsListQuery } from "../utils/newsQuery.js";

// GET /api/news?limit=&page=&q=&topic=bourses
export const listPublicNews = async (req, res) => {
  try {
    const { limit, page, offset, whereSql, params } = buildNewsListQuery(req.query);

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
      WHERE ${whereSql}
      ORDER BY created_at DESC, id DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM news WHERE ${whereSql}`, params);

    return res.json({
      success: true,
      rows,
      total: Number(total) || 0,
      page,
      limit,
      pages: Math.max(1, Math.ceil((Number(total) || 0) / limit)),
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