// attendance.routes.js
import express from 'express';
import * as attendanceController from '../controllers/attendance.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// ✅ Routes avec middleware rôle
router.post("/", requireAuth("teacher"), attendanceController.markAttendance);
router.get("/me", requireAuth("student"), attendanceController.getMyAttendance);
router.get("/course/:course_id", requireAuth("admin", "teacher"), attendanceController.getAttendanceByCourse);

export default router;