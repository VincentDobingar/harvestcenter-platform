import express from 'express';
import * as gradesController from '../controllers/grades.controller.js';
import {requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post("/", requireAuth("teacher"), gradesController.assignGrade);
router.get("/me", requireAuth("student"), gradesController.getMyGrades);
router.get("/course/:course_id", requireAuth("admin", "teacher"), gradesController.getGradesByCourse);
router.get("/student/grades/pdf", requireAuth("student"), gradesController.exportGradesPDF);

export default router;
