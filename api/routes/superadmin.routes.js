import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as superAdminController from "../controllers/superadmin.controller.js";
import { uploadNewsMedia } from "../middlewares/upload.js";

const router = express.Router();

// 🔐 Sécurité globale pour toutes les routes
router.use(requireAuth);
router.use(requireRole("superadmin"));

// 📊 Dashboard
router.get("/dashboard", superAdminController.getSuperAdminStats);

// 📰 NEWS ROUTES
router.post("/news", uploadNewsMedia, superAdminController.createNews);
router.get("/news", superAdminController.getAllNews);
router.get("/news/:id", superAdminController.getNewsById);
router.put("/news/:id", uploadNewsMedia, superAdminController.updateNews);
router.delete("/news/:id", superAdminController.deleteNews);

// 👤 Gestion utilisateurs
router.delete("/user/:id", superAdminController.deleteUser);

export default router;