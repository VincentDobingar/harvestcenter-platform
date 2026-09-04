import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { loginLimiter } from '../middlewares/rateLimit.js';

const router = express.Router();

router.post("/register", loginLimiter, authController.register);
router.post("/login", loginLimiter, authController.login);
router.post("/refresh", authController.refreshToken);
router.post("/logout", authController.logout);
router.get("/sessions", requireAuth(), authController.sessions);
router.delete("/sessions/:id", requireAuth(), authController.deleteSession);
router.get("/me", requireAuth(), authController.me);

export default router;
