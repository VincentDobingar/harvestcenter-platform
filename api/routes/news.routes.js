// routes/news.routes.js
import express from "express";
import {
  listPublicNews,
  getPublicNewsBySlug,
  getPublicNewsById,
} from "../controllers/news.controller.js";

const router = express.Router();

// Liste publique
router.get("/", listPublicNews);

// Détail par slug
router.get("/slug/:slug", getPublicNewsBySlug);

// Détail par id
router.get("/:id(\\d+)", getPublicNewsById);

export default router;