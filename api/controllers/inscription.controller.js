// controllers/inscription.controller.js
import db from "../config/db.js";

const PHONE_REGEX = /^\+?\d{8,15}$/;

function toStr(value) {
  return String(value ?? "").trim();
}

function toNullableStr(value) {
  const v = String(value ?? "").trim();
  return v ? v : null;
}

function toPositiveInt(value, fallback = null) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function normalizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function computeAge(dateStr) {
  const birthDate = new Date(dateStr);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

// GET /inscription/options/formations
export async function getFormationOptions(_req, res) {
  try {
    const [rows] = await db.execute(
      `
      SELECT
        id,
        name AS label
      FROM formations
      WHERE status = 'active'
      ORDER BY name ASC
      `
    );

    return res.json({
      formations: rows || [],
    });
  } catch (error) {
    console.error("Erreur getFormationOptions:", error);
    return res.status(500).json({
      message: "Erreur lors du chargement des formations.",
      formations: [],
    });
  }
}

// GET /inscription/options/niveaux/:module_id
// laissé uniquement pour compatibilité temporaire avec d'anciens builds
export async function getDeprecatedLevels(_req, res) {
  return res.json({
    niveaux: [],
    deprecated: true,
    message: "Cet endpoint n'est plus utilisé.",
  });
}

// GET /inscription/options/timeslots/:niveau_id
// laissé uniquement pour compatibilité temporaire avec d'anciens builds
export async function getDeprecatedTimeSlots(_req, res) {
  return res.json({
    timeSlots: [],
    deprecated: true,
    message: "Cet endpoint n'est plus utilisé.",
  });
}

// POST /inscription/request
export async function createInscriptionRequest(req, res) {
  const conn = await db.getConnection();

  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.student_id ||
      null;

    if (!userId) {
      return res.status(401).json({
        message: "Utilisateur non authentifié.",
      });
    }

    const role = String(req.user?.role || "").toLowerCase();
    if (role && role !== "student") {
      return res.status(403).json({
        message: "Cette page est réservée aux étudiants.",
      });
    }

    const payload = {
      session_id: toPositiveInt(req.body.session_id, 1),
      module_id: toPositiveInt(req.body.module_id),
      niveau_langue: toStr(req.body.niveau_langue),
      horaire_prefere: toStr(req.body.horaire_prefere),
      quartier: toStr(req.body.quartier),
      arrondissement: toStr(req.body.arrondissement),
      telephone: toStr(req.body.telephone),
      whatsapp: toNullableStr(req.body.whatsapp),
      email: toStr(req.body.email).toLowerCase(),
      nom: toStr(req.body.nom),
      prenom: toStr(req.body.prenom),
      sexe: toStr(req.body.sexe).toUpperCase(),
      date_naissance: normalizeDate(
        req.body.date_naissance || req.body.dateNaissance
      ),
      lieu_naissance: toStr(req.body.lieu_naissance || req.body.lieuNaissance),
      accept_fees: req.body.acceptFees ? 1 : 0,
    };

    const required = [
      ["module_id", payload.module_id],
      ["niveau_langue", payload.niveau_langue],
      ["horaire_prefere", payload.horaire_prefere],
      ["nom", payload.nom],
      ["prenom", payload.prenom],
      ["sexe", payload.sexe],
      ["date_naissance", payload.date_naissance],
      ["lieu_naissance", payload.lieu_naissance],
      ["quartier", payload.quartier],
      ["arrondissement", payload.arrondissement],
      ["telephone", payload.telephone],
      ["email", payload.email],
    ];

    const missing = required.filter(([, value]) => !value).map(([key]) => key);

    if (missing.length > 0) {
      return res.status(400).json({
        message: "Veuillez remplir tous les champs obligatoires.",
        missing,
      });
    }

    if (!["M", "F"].includes(payload.sexe)) {
      return res.status(400).json({
        message: "La valeur du sexe est invalide.",
      });
    }

    const age = computeAge(payload.date_naissance);
    if (age === null) {
      return res.status(400).json({
        message: "La date de naissance est invalide.",
      });
    }

    if (age < 10) {
      return res.status(400).json({
        message: "L’âge minimum requis est de 10 ans.",
      });
    }

    if (!PHONE_REGEX.test(payload.telephone)) {
      return res.status(400).json({
        message: "Le numéro de téléphone est invalide.",
      });
    }

    if (payload.whatsapp && !PHONE_REGEX.test(payload.whatsapp)) {
      return res.status(400).json({
        message: "Le numéro WhatsApp est invalide.",
      });
    }

    if (!payload.accept_fees) {
      return res.status(400).json({
        message: "Vous devez accepter les frais d’inscription.",
      });
    }

    // Vérifie qu'il n'existe pas déjà une demande pending pour cet étudiant et cette formation
    const [existing] = await conn.execute(
      `
      SELECT id
      FROM inscription_requests
      WHERE user_id = ?
        AND module_id = ?
        AND status = 'pending'
      LIMIT 1
      `,
      [userId, payload.module_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Une demande en attente existe déjà pour cette formation.",
      });
    }

    const [result] = await conn.execute(
      `
      INSERT INTO inscription_requests (
        user_id,
        session_id,
        module_id,
        niveau_langue,
        horaire_prefere,
        quartier,
        arrondissement,
        telephone,
        whatsapp,
        email,
        nom,
        prenom,
        sexe,
        date_naissance,
        lieu_naissance,
        accept_fees,
        status,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())
      `,
      [
        userId,
        payload.session_id,
        payload.module_id,
        payload.niveau_langue,
        payload.horaire_prefere,
        payload.quartier,
        payload.arrondissement,
        payload.telephone,
        payload.whatsapp,
        payload.email,
        payload.nom,
        payload.prenom,
        payload.sexe,
        payload.date_naissance,
        payload.lieu_naissance,
        payload.accept_fees,
      ]
    );

    return res.status(201).json({
      message: "Votre demande d’inscription a bien été envoyée.",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Erreur createInscriptionRequest:", error);
    return res.status(500).json({
      message: "Une erreur est survenue lors de l’envoi de la demande.",
    });
  } finally {
    conn.release();
  }
}