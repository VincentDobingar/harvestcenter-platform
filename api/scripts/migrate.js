// Applique les fichiers .sql de api/migrations/, dans l'ordre, une seule fois chacun.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "..", "migrations");

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  await connection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const [appliedRows] = await connection.query(
    "SELECT filename FROM schema_migrations"
  );
  const applied = new Set(appliedRows.map((r) => r.filename));

  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (applied.has(file)) {
      console.log(`- ${file} déjà appliquée, ignorée`);
      continue;
    }

    console.log(`> Application de ${file}...`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    await connection.query(sql);
    await connection.query(
      "INSERT INTO schema_migrations (filename) VALUES (?)",
      [file]
    );
    console.log(`  OK`);
  }

  console.log("Migrations à jour.");
  await connection.end();
};

run().catch((err) => {
  console.error("Échec des migrations:", err.message);
  process.exit(1);
});
