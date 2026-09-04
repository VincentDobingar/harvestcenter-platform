// src/routes/stats.routes.js
import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as statsController from '../controllers/stats.controller.js';

const router = express.Router();

// Stats pour un étudiant
router.get('/student/stats', requireAuth("student"), statsController.studentStats);

// Stats admin
router.get(
  '/admin',
  requireAuth("admin"),
  statsController.adminStats
);

// Exemple de route de stats générales (ou dashboard admin simple)
router.get(
  '/',
  requireAuth("admin"),
  (req, res) => {
    res.json({
      revenus: 250000,
      inscriptions: 124,
      taux_presence: 92
    });
  }
);

// Vue d’ensemble simple protégée par requireAuth
router.get('/overview', requireAuth(), async (req, res) => {
  res.json({
    users: 120,
    students: 80,
    teachers: 12
  });
});

export default router;
