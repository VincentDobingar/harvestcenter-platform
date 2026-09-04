// routes/inscription.routes.js
import express from "express";
import {
  getFormationOptions,
  getDeprecatedLevels,
  getDeprecatedTimeSlots,
  createInscriptionRequest,
} from "../controllers/inscription.controller.js";

import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Options utilisées par le nouveau formulaire
router.get("/options/formations", getFormationOptions);

// Endpoints legacy temporaires
router.get("/options/niveaux/:module_id", getDeprecatedLevels);
router.get("/options/timeslots/:niveau_id", getDeprecatedTimeSlots);

// Soumission
router.post("/request", requireAuth(), createInscriptionRequest);

export default router;