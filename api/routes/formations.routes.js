import express from 'express';
import { requireAuth  } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/requireRole.js';

import {
  getFormations,
  getFormationById,
  enrollUser,
  getFormationStats
} from '../controllers/formations.controller.js';

const router = express.Router();

router.get('/', getFormations);
router.get('/:id', getFormationById);
router.post('/:id/enroll', requireAuth(), enrollUser);
router.get('/:id/stats', requireAuth(), requireRole('admin', 'teacher'), getFormationStats);

export default router;
