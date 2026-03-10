import express from 'express';
import db from '../config/db.js';
import * as gradesController from '../controllers/grades.controller.js';
import {requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET toutes les notes (public/test)
router.get('/grades', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM grades LIMIT 10');
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Autres routes avec auth
router.post("/", requireAuth (["teacher"]), gradesController.assignGrade);
router.get("/me",requireAuth (["student"]), gradesController.getMyGrades);
router.get("/course/:course_id", requireAuth (["admin", "teacher"]), gradesController.getGradesByCourse);
router.get("/student/grades/pdf", requireAuth (["student"]), gradesController.exportGradesPDF);

export default router;
