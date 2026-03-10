// teacher.routes.js
import express from 'express';
import { requireAuth } from '../middlewares/auth.middleware.js';
import * as teacherController from '../controllers/teacher.controller.js';

const router = express.Router();

// 🔹 Routes sécurisées pour enseignants
router.get('/courses', requireAuth("teacher"), teacherController.getMyCourses);

router.get('/courses/:course_id/students', requireAuth("teacher"), teacherController.getStudentsByCourse);

router.post( '/assignments',
  requireAuth("teacher"),
  teacherController.createAssignment
);

router.post(
  '/grades',
  requireAuth("teacher"),
  teacherController.addGrade
);

router.post(
  '/attendance',
  requireAuth("teacher"),
  teacherController.markAttendance
);

router.get(
  '/export/stats',
  requireAuth("teacher"),
  teacherController.exportTeacherStatsExcel
);

export default router;