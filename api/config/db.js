import mysql from "mysql2/promise";
import dotenv from "dotenv";

// 🔑 Charger les variables d'environnement avant toute chose
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,       // ne mets plus de valeur par défaut ici
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
