import express from "express";

const router = express.Router();

import mysql from "mysql2/promise";

router.get("/", async (req, res) => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    await connection.ping();
    await connection.end();

    res.json({ status: "OK", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "ERROR", message: error.message });
  }
});



export default router;
