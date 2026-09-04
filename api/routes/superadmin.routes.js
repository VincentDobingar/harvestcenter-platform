// routes/superadmin.routes.js
import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as superAdminController from "../controllers/superadmin.controller.js";
import * as opportunitiesController from "../controllers/opportunities.controller.js";
import { uploadOpportunityImage } from "../middlewares/uploadOpportunity.js";
import { uploadNewsMedia } from "../middlewares/upload.js";

const router = express.Router();

// Sécurité globale superadmin
router.use(requireAuth());
router.use(requireRole("superadmin"));

// Dashboard
router.get("/dashboard", superAdminController.getSuperAdminStats);

// News
router.get("/news", superAdminController.getAllNews);
router.get("/news/:id(\\d+)", superAdminController.getNewsById);
router.post("/news", uploadNewsMedia, superAdminController.createNews);
router.put("/news/:id(\\d+)", uploadNewsMedia, superAdminController.updateNews);
router.delete("/news/:id(\\d+)", superAdminController.deleteNews);

// Opportunities
router.get("/opportunities", opportunitiesController.listAdminOpportunities);
router.get("/opportunities/:id(\\d+)", opportunitiesController.getAdminOpportunityById);
router.post("/opportunities", uploadOpportunityImage, opportunitiesController.createOpportunity);
router.put("/opportunities/:id(\\d+)", uploadOpportunityImage, opportunitiesController.updateOpportunity);
router.delete("/opportunities/:id(\\d+)", opportunitiesController.deleteOpportunity);

// Users
router.get("/users", superAdminController.listUsers);
router.get("/users/:id(\\d+)", superAdminController.getUserById);
router.put("/users/:id(\\d+)", superAdminController.updateUser);
router.delete("/users/:id(\\d+)", superAdminController.deleteUser);

export default router;