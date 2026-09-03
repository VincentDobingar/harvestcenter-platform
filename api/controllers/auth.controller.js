// api/controllers/auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_EXPIRES = 15 * 60 * 1000;
const REFRESH_EXPIRES = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  domain: isProduction ? ".harvestcentertd.org" : undefined,
  path: "/",
};

const normalizeRole = (role) => {
  const value = String(role || "").trim().toLowerCase();

  const map = {
    student: "student",
    etudiant: "student",
    "étudiant": "student",

    teacher: "teacher",
    enseignant: "teacher",
    formateur: "teacher",

    admin: "admin",
    superadmin: "superadmin",
    super_admin: "superadmin",
  };

  return map[value] || "student";
};

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: normalizeRole(user.role) },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

export const register = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  const normalizeRole = (value) => {
    const v = String(value || "").trim().toLowerCase();

    const map = {
      student: "student",
      etudiant: "student",
      "étudiant": "student",

      teacher: "teacher",
      enseignant: "teacher",
      formateur: "teacher",

      admin: "admin",
      administrateur: "admin",

      superadmin: "superadmin",
      super_admin: "superadmin",
    };

    return map[v] || null;
  };

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Tous les champs sont requis",
    });
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = normalizeRole(role) || "student";

    // Register public : jamais admin ni superadmin
    if (!["student", "teacher"].includes(normalizedRole)) {
      return res.status(403).json({
        message: "Le rôle demandé n'est pas autorisé via l'inscription publique",
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existing.length) {
      return res.status(409).json({
        message: "Email déjà utilisé",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO users
       (first_name, last_name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [
        String(first_name).trim(),
        String(last_name).trim(),
        normalizedEmail,
        hashedPassword,
        normalizedRole,
      ]
    );

    return res.status(201).json({
      message: "Compte créé avec succès",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({ message: "Email et mot de passe requis" });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [normalizedEmail]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const user = rows[0];

    if (user.status !== "active") {
      return res.status(403).json({ message: "Compte non activé" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    await db.query("DELETE FROM refresh_tokens WHERE user_id=?", [user.id]);

    const normalizedUser = {
      ...user,
      role: normalizeRole(user.role),
    };

    const accessToken = generateAccessToken(normalizedUser);
    const refreshToken = generateRefreshToken(normalizedUser);

    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, token, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken, userAgent, ip]
    );

    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_EXPIRES,
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRES,
    });

    return res.json({
      message: "Connexion réussie",
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const me = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE id=?",
      [userId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    const user = rows[0];

    return res.json({
      user: {
        ...user,
        role: normalizeRole(user.role),
      },
    });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;

  if (!token) {
    return res.status(401).json({ message: "Session expirée" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const [rows] = await db.query(
      `SELECT * FROM refresh_tokens WHERE token=? AND user_id=? AND expires_at > NOW()`,
      [token, decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Session invalide" });
    }

    const [userRows] = await db.query(
      "SELECT * FROM users WHERE id=?",
      [decoded.id]
    );

    const user = userRows[0];

    if (!user || user.status !== "active") {
      return res.status(403).json({ message: "Compte non actif" });
    }

    const normalizedUser = {
      ...user,
      role: normalizeRole(user.role),
    };

    const accessToken = generateAccessToken(normalizedUser);

    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_EXPIRES,
    });

    return res.json({ message: "Session rafraîchie" });
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    return res.status(401).json({ message: "Session invalide" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refresh_token;

  try {
    if (token) {
      await db.query("DELETE FROM refresh_tokens WHERE token=?", [token]);
    }

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    return res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const sessions = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    const [rows] = await db.query(
      `SELECT id, user_agent, ip_address, created_at, expires_at
       FROM refresh_tokens WHERE user_id=? ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ sessions: rows });
  } catch (err) {
    console.error("SESSIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteSession = async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    const [result] = await db.query(
      "DELETE FROM refresh_tokens WHERE id=? AND user_id=?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Session introuvable" });
    }

    return res.json({ message: "Session révoquée" });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};