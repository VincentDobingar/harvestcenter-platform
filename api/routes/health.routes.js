import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.ping();
    connection.release();

    res.json({ status: "OK", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "ERROR", message: "Database unreachable" });
  }
});

export default router;
