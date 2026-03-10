import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";

/* =====================================
   CONFIG
===================================== */

const isProduction = process.env.NODE_ENV === "production";

const ACCESS_EXPIRES = 15 * 60 * 1000; // 15 min
const REFRESH_EXPIRES = 7 * 24 * 60 * 60 * 1000; // 7 jours

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "None" : "Lax",
  domain: isProduction ? ".harvestcentertd.org" : undefined,
  path: "/"
};

/* =====================================
   TOKEN HELPERS
===================================== */

const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  
 /* =====================================
   REGISTER
===================================== */
export const register = async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      message: "Tous les champs sont requis",
    });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email=?",
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
       VALUES (?, ?, ?, ?, 'student', 'active')`,
      [first_name, last_name, normalizedEmail, hashedPassword]
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

/* =====================================
   LOGIN
===================================== */

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

    // Supprime anciens refresh tokens (sécurité ++)
    await db.query("DELETE FROM refresh_tokens WHERE user_id=?", [user.id]);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

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
      maxAge: ACCESS_EXPIRES
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRES
    });

    return res.json({ message: "Connexion réussie" });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================================
   ME
===================================== */

export const me = async (req, res) => {

  const userId = req.user?.id;

  if (!userId) {
    console.log("❌ No userId");
    return res.status(401).json({ message: "Non connecté" });
  }

  try {
    console.log("🔎 Before DB query");

    const [rows] = await db.query(
      "SELECT id, first_name, last_name, email, role FROM users WHERE id=?",
      [userId]
    );

    console.log("✅ After DB query", rows);

    if (!rows.length) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    console.error("ME ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};


/* =====================================
   REFRESH TOKEN (Rotation sécurisée)
===================================== */

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refresh_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    // Vérifie signature JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    // Vérifie en base + expiration
    const [[stored]] = await db.query(
      `SELECT * FROM refresh_tokens 
       WHERE token=? AND expires_at > NOW()`,
      [token]
    );

    if (!stored) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    // Vérification fingerprint (sécurité anti-vol)
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    if (
      stored.user_agent !== userAgent ||
      stored.ip_address !== ip
    ) {
      // Supprime token suspect
      await db.query(
        "DELETE FROM refresh_tokens WHERE token=?",
        [token]
      );

      return res.status(403).json({ message: "Token suspicious" });
    }

    // Supprime ancien token (rotation)
    await db.query(
      "DELETE FROM refresh_tokens WHERE token=?",
      [token]
    );

    // Vérifie que l'utilisateur existe
    const [[user]] = await db.query(
      "SELECT id, role FROM users WHERE id=?",
      [decoded.id]
    );

    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // Génère nouveaux tokens
    const newAccess = generateAccessToken(user);
    const newRefresh = generateRefreshToken(user);

    // Stocke nouveau refresh token
    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, token, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, newRefresh, userAgent, ip]
    );

    // Set cookies
    res.cookie("access_token", newAccess, {
      ...cookieOptions,
      maxAge: ACCESS_EXPIRES
    });

    res.cookie("refresh_token", newRefresh, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRES
    });

    return res.json({ message: "Token refreshed" });

  } catch (err) {
    console.error("REFRESH ERROR:", err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

/* =====================================
   LOGOUT
===================================== */

export const logout = async (req, res) => {
  const token = req.cookies.refresh_token;

  try {
    if (token) {
      await db.query("DELETE FROM refresh_tokens WHERE token=?", [token]);
    }

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    return res.json({ message: "Logged out" });

  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    return res.status(500).json({ message: "Erreur logout" });
  }
};

/* ================================
   VERIFY OTP (2FA)
================================ */

export const verifyOTP = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      message: "OTP requis",
    });
  }

  try {
    // Vérifie OTP valide
    const [[storedOTP]] = await db.query(
      `SELECT * FROM otp_codes
       WHERE user_id=? AND code=? AND expires_at > NOW()`,
      [userId, otp]
    );

    if (!storedOTP) {
      return res.status(400).json({
        message: "Code invalide ou expiré",
      });
    }

    // Supprime OTP utilisé
    await db.query(
      "DELETE FROM otp_codes WHERE id=?",
      [storedOTP.id]
    );

    // Récupère utilisateur
    const [[user]] = await db.query(
      "SELECT id, role FROM users WHERE id=?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({
        message: "Utilisateur introuvable",
      });
    }

    // Génère tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    // Stocke refresh token avec fingerprint
    await db.query(
      `INSERT INTO refresh_tokens 
       (user_id, token, user_agent, ip_address, expires_at)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [user.id, refreshToken, userAgent, ip]
    );

    // Set cookies
    res.cookie("access_token", accessToken, {
      ...cookieOptions,
      maxAge: ACCESS_EXPIRES
    });

    res.cookie("refresh_token", refreshToken, {
      ...cookieOptions,
      maxAge: REFRESH_EXPIRES
    });

    return res.json({
      message: "2FA validé",
    });

  } catch (err) {
    console.error("OTP VERIFY ERROR:", err);

    return res.status(500).json({
      message: "Erreur vérification OTP",
    });
  }
};

/* ================================
   SESSIONS
================================ */

export const sessions = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      message: "Utilisateur non identifié",
    });
  }

  try {
    const [sessions] = await db.query(
      `SELECT id, ip_address, user_agent, created_at
       FROM user_sessions
       WHERE user_id=?
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({ sessions });
  } catch (err) {
    console.error("SESSIONS ERROR:", err);

    return res.status(500).json({
      message: "Erreur récupération sessions",
    });
  }
};

export const deleteSession = async (req, res) => {
  const userId = req.user?.id;
  const sessionId = req.params.id;

  if (!userId || !sessionId) {
    return res.status(400).json({
      message: "Session ou utilisateur manquant",
    });
  }

  try {
    await db.query(
      "DELETE FROM user_sessions WHERE id=? AND user_id=?",
      [sessionId, userId]
    );

    return res.json({
      message: "Session supprimée",
    });
  } catch (err) {
    console.error("DELETE SESSION ERROR:", err);

    return res.status(500).json({
      message: "Erreur suppression session",
    });
  }
};