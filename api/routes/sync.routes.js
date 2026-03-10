import express from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { offlineSyncGuard } from "../middlewares/offlineSync.middleware.js";
import { syncOfflineActions } from "../controllers/sync.controller.js";

const router = express.Router();

router.post(
  "/",
  requireAuth,
  offlineSyncGuard,
  syncOfflineActions
);

export default router;
