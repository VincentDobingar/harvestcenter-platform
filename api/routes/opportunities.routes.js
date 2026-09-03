// routes/opportunities.routes.js
import express from "express";
import * as opportunitiesController from "../controllers/opportunities.controller.js";

const router = express.Router();

// Public
router.get("/", opportunitiesController.getPublishedOpportunities);
router.get("/slug/:slug", opportunitiesController.getPublicOpportunityBySlug);
router.get("/:id(\\d+)", opportunitiesController.getOpportunityById);

export default router;