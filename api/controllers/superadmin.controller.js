// controllers/superadmin.controller.js
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NEWS_UPLOAD_DIR = path.join(__dirname, "../uploads/news");

function slugify(text = "") {
  return String(text)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeBool(value, defaultValue = true) {
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1" || value === "true") return true;
  if (value === 0 || value === "0" || value === "false") return false;
  return defaultValue;
}

function splitFullName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first_name: "", last_name: "" };
  if (parts.length === 1) return { first_name: parts[0], last_name: "" };

  const first_name = parts.shift();
  const last_name = parts.join(" ");
  return { first_name, last_name };
}

async function makeUniqueNewsSlug(title, currentId = null) {
  const base = slugify(title) || "news";
  let slug = base;
  let i = 1;

  while (true) {
    let sql = "SELECT id FROM news WHERE slug = ?";
    const params = [slug];

    if (currentId) {
      sql += " AND id <> ?";
      params.push(currentId);
    }

    const [rows] = await db.query(sql, params);
    if (!rows.length) return slug;

    slug = `${base}-${i}`;
    i++;
  }
}

async function deleteLocalNewsImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/news/")) return;

  const fileName = path.basename(imageUrl);
  const fullPath = path.join(NEWS_UPLOAD_DIR, fileName);

  try {
    if (fs.existsSync(fullPath)) {
      await fsp.unlink(fullPath);
    }
  } catch (error) {
    console.error("deleteLocalNewsImage error:", error);
  }
}

/* =========================
   DASHBOARD
========================= */
export const getSuperAdminStats = async (_req, res) => {
  try {
    const [[usersRow]] = await db.query(`SELECT COUNT(*) AS total FROM users`);
    const [[newsRow]] = await db.query(`SELECT COUNT(*) AS total FROM news`);
    const [[oppsRow]] = await db.query(`SELECT COUNT(*) AS total FROM opportunities`);

    return res.json({
      success: true,
      users: Number(usersRow?.total || 0),
      news: Number(newsRow?.total || 0),
      opportunities: Number(oppsRow?.total || 0),
    });
  } catch (error) {
    console.error("getSuperAdminStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des statistiques.",
    });
  }
};

/* =========================
   USERS
   Compatible avec une table users
   contenant first_name, last_name, email, role, status
========================= */
export const listUsers = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        CONCAT_WS(' ', first_name, last_name) AS name,
        email,
        role,
        CASE WHEN status = 'active' THEN 1 ELSE 0 END AS is_active,
        created_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("listUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des utilisateurs.",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        id,
        CONCAT_WS(' ', first_name, last_name) AS name,
        email,
        role,
        CASE WHEN status = 'active' THEN 1 ELSE 0 END AS is_active,
        created_at
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getUserById error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l'utilisateur.",
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, is_active } = req.body;

    const [existingRows] = await db.query(
      `SELECT id FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    const { first_name, last_name } = splitFullName(name);
    const status = normalizeBool(is_active, true) ? "active" : "inactive";

    await db.query(
      `
      UPDATE users
      SET
        first_name = ?,
        last_name = ?,
        email = ?,
        role = ?,
        status = ?
      WHERE id = ?
      `,
      [
        first_name || null,
        last_name || null,
        email || null,
        role || "student",
        status,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Utilisateur mis à jour avec succès.",
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l'utilisateur.",
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await db.query(
      `SELECT id FROM users WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable.",
      });
    }

    await db.query(`DELETE FROM users WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: "Utilisateur supprimé avec succès.",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur.",
    });
  }
};

/* =========================
   NEWS - ADMIN / SUPERADMIN
   Compatible avec la table news :
   title, slug, content, excerpt, image_url, video_url,
   media_type, is_active, created_by, updated_by, created_at, updated_at
========================= */
export const getAllNews = async (_req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT *
      FROM news
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("getAllNews error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des news.",
    });
  }
};

export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT *
      FROM news
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "News introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getNewsById error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de la news.",
    });
  }
};

export const createNews = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt = "",
      is_active = true,
    } = req.body;

    if (!title || !String(title).trim()) {
      if (req.file) {
        await deleteLocalNewsImage(`/uploads/news/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Le titre est obligatoire.",
      });
    }

    const safeTitle = String(title).trim();
    const slug = await makeUniqueNewsSlug(safeTitle);
    const image_url = req.file ? `/uploads/news/${req.file.filename}` : null;

    const [result] = await db.query(
      `
      INSERT INTO news (
        title,
        slug,
        content,
        excerpt,
        image_url,
        video_url,
        media_type,
        is_active,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        safeTitle,
        slug,
        content || "",
        excerpt || null,
        image_url,
        null,
        image_url ? "image" : "none",
        normalizeBool(is_active, true) ? 1 : 0,
        req.user?.id || null,
        req.user?.id || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "News créée avec succès.",
      data: {
        id: result.insertId,
        slug,
        image_url,
      },
    });
  } catch (error) {
    if (req.file) {
      await deleteLocalNewsImage(`/uploads/news/${req.file.filename}`);
    }

    console.error("createNews error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de la news.",
    });
  }
};

export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      content,
      excerpt,
      is_active = true,
    } = req.body;

    const [existingRows] = await db.query(
      `SELECT * FROM news WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!existingRows.length) {
      if (req.file) {
        await deleteLocalNewsImage(`/uploads/news/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "News introuvable.",
      });
    }

    const existing = existingRows[0];
    const safeTitle = title?.trim() || existing.title;
    const slug = await makeUniqueNewsSlug(safeTitle, id);

    let image_url = existing.image_url;
    if (req.file) {
      await deleteLocalNewsImage(existing.image_url);
      image_url = `/uploads/news/${req.file.filename}`;
    }

    await db.query(
      `
      UPDATE news
      SET
        title = ?,
        slug = ?,
        content = ?,
        excerpt = ?,
        image_url = ?,
        media_type = ?,
        is_active = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        safeTitle,
        slug,
        content ?? existing.content,
        excerpt ?? existing.excerpt,
        image_url,
        image_url ? "image" : "none",
        normalizeBool(is_active, existing.is_active) ? 1 : 0,
        req.user?.id || null,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "News mise à jour avec succès.",
      data: {
        id: Number(id),
        slug,
        image_url,
      },
    });
  } catch (error) {
    if (req.file) {
      await deleteLocalNewsImage(`/uploads/news/${req.file.filename}`);
    }

    console.error("updateNews error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de la news.",
    });
  }
};

export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await db.query(
      `SELECT id, image_url FROM news WHERE id = ? LIMIT 1`,
      [id]
    );

    if (!existingRows.length) {
      return res.status(404).json({
        success: false,
        message: "News introuvable.",
      });
    }

    await deleteLocalNewsImage(existingRows[0].image_url);
    await db.query(`DELETE FROM news WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: "News supprimée avec succès.",
    });
  } catch (error) {
    console.error("deleteNews error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de la news.",
    });
  }
};