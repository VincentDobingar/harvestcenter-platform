import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/sessions", requireAuth(), authController.sessions);
router.delete("/sessions/:id", requireAuth(), authController.deleteSession);
router.get("/me", requireAuth(), authController.me);

export default router;
