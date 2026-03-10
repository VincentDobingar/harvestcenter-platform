import pool from "./config/db.js";

(async () => {
  try {
    const [rows] = await pool.query("SELECT 1+1 AS test");
    console.log("✅ Test DB OK :", rows[0]);
  } catch (err) {
    console.error("❌ Test DB ERREUR :", err.message);
  }
})();
