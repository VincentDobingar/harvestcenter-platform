import express from "express";
import { getAssignments } from "../controllers/assignments.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", requireAuth, getAssignments);

export default router;