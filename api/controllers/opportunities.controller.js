// controllers/opportunities.controller.js
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import db from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OPPORTUNITIES_UPLOAD_DIR = path.join(__dirname, "../uploads/opportunities");

const ALLOWED_TYPES = [
  "scholarship",
  "fellowship",
  "job",
  "internship",
  "training",
  "grant",
  "other",
];

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

function normalizeType(value, fallback = "other") {
  const v = String(value || "").trim().toLowerCase();
  return ALLOWED_TYPES.includes(v) ? v : fallback;
}

function cleanText(value) {
  const v = String(value ?? "").trim();
  return v ? v : null;
}

function firstFilled(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (value !== null && value !== undefined && String(value).trim()) {
      return String(value).trim();
    }
  }
  return null;
}

async function makeUniqueSlug(title, currentId = null) {
  const base = slugify(title) || "opportunity";
  let slug = base;
  let i = 1;

  while (true) {
    let sql = "SELECT id FROM opportunities WHERE slug = ?";
    const params = [slug];

    if (currentId) {
      sql += " AND id <> ?";
      params.push(currentId);
    }

    const [rows] = await db.query(sql, params);

    if (!rows.length) {
      return slug;
    }

    slug = `${base}-${i}`;
    i++;
  }
}

async function deleteLocalImage(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/uploads/opportunities/")) return;

  const fileName = path.basename(imageUrl);
  const fullPath = path.join(OPPORTUNITIES_UPLOAD_DIR, fileName);

  try {
    if (fs.existsSync(fullPath)) {
      await fsp.unlink(fullPath);
    }
  } catch (error) {
    console.error("deleteLocalImage error:", error);
  }
}

function buildLocalizedPayload(body = {}, existing = null) {
  const title_fr = cleanText(body.title_fr ?? body.titleFr ?? body.title) ?? cleanText(existing?.title_fr ?? existing?.title);
  const title_en = cleanText(body.title_en ?? body.titleEn) ?? cleanText(existing?.title_en);

  const sponsor_fr = cleanText(body.sponsor_fr ?? body.sponsorFr ?? body.sponsor) ?? cleanText(existing?.sponsor_fr ?? existing?.sponsor);
  const sponsor_en = cleanText(body.sponsor_en ?? body.sponsorEn) ?? cleanText(existing?.sponsor_en);

  const location_fr = cleanText(body.location_fr ?? body.locationFr ?? body.location) ?? cleanText(existing?.location_fr ?? existing?.location);
  const location_en = cleanText(body.location_en ?? body.locationEn) ?? cleanText(existing?.location_en);

  const country_fr = cleanText(body.country_fr ?? body.countryFr ?? body.country) ?? cleanText(existing?.country_fr ?? existing?.country);
  const country_en = cleanText(body.country_en ?? body.countryEn) ?? cleanText(existing?.country_en);

  const summary_fr = cleanText(body.summary_fr ?? body.summaryFr ?? body.summary) ?? cleanText(existing?.summary_fr ?? existing?.summary);
  const summary_en = cleanText(body.summary_en ?? body.summaryEn) ?? cleanText(existing?.summary_en);

  const content_fr = cleanText(body.content_fr ?? body.contentFr ?? body.content) ?? cleanText(existing?.content_fr ?? existing?.content);
  const content_en = cleanText(body.content_en ?? body.contentEn) ?? cleanText(existing?.content_en);

  return {
    title: firstFilled(title_fr, title_en, existing?.title),
    title_fr,
    title_en,

    sponsor: firstFilled(sponsor_fr, sponsor_en, existing?.sponsor),
    sponsor_fr,
    sponsor_en,

    location: firstFilled(location_fr, location_en, existing?.location),
    location_fr,
    location_en,

    country: firstFilled(country_fr, country_en, existing?.country),
    country_fr,
    country_en,

    summary: firstFilled(summary_fr, summary_en, existing?.summary),
    summary_fr,
    summary_en,

    content: firstFilled(content_fr, content_en, existing?.content),
    content_fr,
    content_en,
  };
}

/* =========================
   PUBLIC
========================= */
export const listPublicOpportunities = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const q = String(req.query.q || "").trim();
    const type = normalizeType(req.query.type, "");

    const where = ["is_active = 1"];
    const params = [];

    if (type) {
      where.push("type = ?");
      params.push(type);
    }

    if (q) {
      const search = `%${q}%`;
      where.push(`
        (
          title LIKE ?
          OR title_fr LIKE ?
          OR title_en LIKE ?
          OR sponsor LIKE ?
          OR sponsor_fr LIKE ?
          OR sponsor_en LIKE ?
          OR location LIKE ?
          OR location_fr LIKE ?
          OR location_en LIKE ?
          OR country LIKE ?
          OR country_fr LIKE ?
          OR country_en LIKE ?
          OR summary LIKE ?
          OR summary_fr LIKE ?
          OR summary_en LIKE ?
          OR content LIKE ?
          OR content_fr LIKE ?
          OR content_en LIKE ?
        )
      `);

      params.push(
        search, search, search,
        search, search, search,
        search, search, search,
        search, search, search,
        search, search, search,
        search, search, search
      );
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [countRows] = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM opportunities
      ${whereSql}
      `,
      params
    );

    const [rows] = await db.query(
      `
      SELECT
        id,
        title,
        title_fr,
        title_en,
        slug,
        type,
        sponsor,
        sponsor_fr,
        sponsor_en,
        location,
        location_fr,
        location_en,
        country,
        country_fr,
        country_en,
        deadline,
        summary,
        summary_fr,
        summary_en,
        content,
        content_fr,
        content_en,
        apply_url,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM opportunities
      ${whereSql}
      ORDER BY
        CASE WHEN deadline IS NULL THEN 1 ELSE 0 END,
        deadline ASC,
        created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const total = Number(countRows[0]?.total || 0);

    return res.json({
      success: true,
      rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("listPublicOpportunities error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des opportunités.",
    });
  }
};

export const getPublishedOpportunities = listPublicOpportunities;

export const getOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT *
      FROM opportunities
      WHERE id = ? AND is_active = 1
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Opportunité introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getOpportunityById error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l’opportunité.",
    });
  }
};

export const getPublicOpportunityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const [rows] = await db.query(
      `
      SELECT *
      FROM opportunities
      WHERE slug = ? AND is_active = 1
      LIMIT 1
      `,
      [slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Opportunité introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getPublicOpportunityBySlug error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l’opportunité.",
    });
  }
};

/* =========================
   ADMIN / SUPERADMIN
========================= */
export const listAdminOpportunities = async (_req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT *
      FROM opportunities
      ORDER BY created_at DESC
      `
    );

    return res.json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error("listAdminOpportunities error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement des opportunités.",
    });
  }
};

export const getAdminOpportunityById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT *
      FROM opportunities
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Opportunité introuvable.",
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("getAdminOpportunityById error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors du chargement de l’opportunité.",
    });
  }
};

export const createOpportunity = async (req, res) => {
  try {
    const {
      type = "other",
      deadline = null,
      apply_url = "",
      is_active = true,
    } = req.body;

    const localized = buildLocalizedPayload(req.body);
    const safeTitle = localized.title;

    if (!safeTitle) {
      if (req.file) {
        await deleteLocalImage(`/uploads/opportunities/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Le titre est obligatoire en français ou en anglais.",
      });
    }

    const safeType = normalizeType(type, "other");
    const slug = await makeUniqueSlug(safeTitle);
    const image_url = req.file ? `/uploads/opportunities/${req.file.filename}` : null;

    const [result] = await db.query(
      `
      INSERT INTO opportunities (
        title,
        title_fr,
        title_en,
        slug,
        type,
        sponsor,
        sponsor_fr,
        sponsor_en,
        location,
        location_fr,
        location_en,
        country,
        country_fr,
        country_en,
        deadline,
        summary,
        summary_fr,
        summary_en,
        content,
        content_fr,
        content_en,
        apply_url,
        image_url,
        is_active,
        created_by,
        updated_by,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        localized.title,
        localized.title_fr,
        localized.title_en,
        slug,
        safeType,
        localized.sponsor,
        localized.sponsor_fr,
        localized.sponsor_en,
        localized.location,
        localized.location_fr,
        localized.location_en,
        localized.country,
        localized.country_fr,
        localized.country_en,
        deadline || null,
        localized.summary,
        localized.summary_fr,
        localized.summary_en,
        localized.content,
        localized.content_fr,
        localized.content_en,
        apply_url || null,
        image_url,
        normalizeBool(is_active, true) ? 1 : 0,
        req.user?.id || null,
        req.user?.id || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Opportunité créée avec succès.",
      data: {
        id: result.insertId,
        slug,
        image_url,
      },
    });
  } catch (error) {
    if (req.file) {
      await deleteLocalImage(`/uploads/opportunities/${req.file.filename}`);
    }

    console.error("createOpportunity error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l’opportunité.",
    });
  }
};

export const updateOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const [existingRows] = await db.query(
      `
      SELECT *
      FROM opportunities
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!existingRows.length) {
      if (req.file) {
        await deleteLocalImage(`/uploads/opportunities/${req.file.filename}`);
      }

      return res.status(404).json({
        success: false,
        message: "Opportunité introuvable.",
      });
    }

    const existing = existingRows[0];
    const localized = buildLocalizedPayload(req.body, existing);
    const safeTitle = localized.title;

    if (!safeTitle) {
      if (req.file) {
        await deleteLocalImage(`/uploads/opportunities/${req.file.filename}`);
      }

      return res.status(400).json({
        success: false,
        message: "Le titre est obligatoire en français ou en anglais.",
      });
    }

    const slug = await makeUniqueSlug(safeTitle, id);
    const safeType = normalizeType(req.body.type, existing.type);

    const deadline =
      req.body.deadline === undefined
        ? existing.deadline
        : req.body.deadline || null;

    let image_url = existing.image_url;
    if (req.file) {
      await deleteLocalImage(existing.image_url);
      image_url = `/uploads/opportunities/${req.file.filename}`;
    }

    await db.query(
      `
      UPDATE opportunities
      SET
        title = ?,
        title_fr = ?,
        title_en = ?,
        slug = ?,
        type = ?,
        sponsor = ?,
        sponsor_fr = ?,
        sponsor_en = ?,
        location = ?,
        location_fr = ?,
        location_en = ?,
        country = ?,
        country_fr = ?,
        country_en = ?,
        deadline = ?,
        summary = ?,
        summary_fr = ?,
        summary_en = ?,
        content = ?,
        content_fr = ?,
        content_en = ?,
        apply_url = ?,
        image_url = ?,
        is_active = ?,
        updated_by = ?,
        updated_at = NOW()
      WHERE id = ?
      `,
      [
        localized.title,
        localized.title_fr,
        localized.title_en,
        slug,
        safeType,
        localized.sponsor,
        localized.sponsor_fr,
        localized.sponsor_en,
        localized.location,
        localized.location_fr,
        localized.location_en,
        localized.country,
        localized.country_fr,
        localized.country_en,
        deadline,
        localized.summary,
        localized.summary_fr,
        localized.summary_en,
        localized.content,
        localized.content_fr,
        localized.content_en,
        req.body.apply_url ?? existing.apply_url,
        image_url,
        normalizeBool(req.body.is_active, existing.is_active) ? 1 : 0,
        req.user?.id || null,
        id,
      ]
    );

    return res.json({
      success: true,
      message: "Opportunité mise à jour avec succès.",
      data: {
        id: Number(id),
        slug,
        image_url,
      },
    });
  } catch (error) {
    if (req.file) {
      await deleteLocalImage(`/uploads/opportunities/${req.file.filename}`);
    }

    console.error("updateOpportunity error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour de l’opportunité.",
    });
  }
};

export const deleteOpportunity = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT image_url
      FROM opportunities
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Opportunité introuvable.",
      });
    }

    await deleteLocalImage(rows[0].image_url);
    await db.query(`DELETE FROM opportunities WHERE id = ?`, [id]);

    return res.json({
      success: true,
      message: "Opportunité supprimée avec succès.",
    });
  } catch (error) {
    console.error("deleteOpportunity error:", error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l’opportunité.",
    });
  }
};