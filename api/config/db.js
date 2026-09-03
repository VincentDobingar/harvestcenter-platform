// config/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// 🔑 Chargement des variables d'environnement 
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,      
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

// ✅ Test de connexion MySQL
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL connecté avec succès !");
    connection.release();
  } catch (err) {
    console.error("❌ ERREUR MySQL :", err.message);
  }
})();

export default pool;
