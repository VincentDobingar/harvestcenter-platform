import express from "express";
import fs from "fs";
import path from "path";

// Crée un fichier de log d'erreur temporaire
const logFile = path.resolve('./tmp/error.log');

function logError(message, err) {
  const fullMessage = `[${new Date().toISOString()}] ${message}: ${err?.stack || err}\n`;
  fs.appendFileSync(logFile, fullMessage);
  console.error(fullMessage);
}

const app = express();

// Middleware JSON
app.use(express.json());

// Route test simple
app.get("/", (req, res) => {
  res.send("Harvest Center TD API 🚀 - SAFE MODE");
});

// ⚠️ Safe initialization
try {
  // Exemple: init DB
  const DB_HOST = process.env.DB_HOST;
  const DB_USER = process.env.DB_USER;
  const DB_PASSWORD = process.env.DB_PASSWORD;
  const DB_NAME = process.env.DB_NAME;

  if (!DB_HOST || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error("DB configuration missing in .env");
  }
  // Ici tu peux mettre la vraie init mysql2 mais en try/catch
  // ex:
  // import mysql from 'mysql2/promise';
  // const pool = mysql.createPool({...});
} catch (err) {
  logError("Database initialization failed", err);
}

// Exemple: JWT secret check
try {
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT secrets missing");
  }
} catch (err) {
  logError("JWT initialization failed", err);
}

// Exemple: Stripe key check
try {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe key missing");
  }
} catch (err) {
  logError("Stripe initialization failed", err);
}

// Tu peux ajouter ici d’autres services externes (SMTP, WP API, etc.) en try/catch

export default app;