import express from 'express';
import { requireAuth  } from '../middlewares/auth.middleware.js';
import * as studentController from '../controllers/student.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/dashboard", requireAuth ("student"), studentController.dashboard);
router.get("/assignments", requireAuth ("student"), studentController.getMyAssignments);
router.post("/assignments/:assignment_id/submit", requireAuth ("student"), upload.single("file"), studentController.submitAssignment);
router.get("/grades", requireAuth ("student"), studentController.getMyGrades);
router.get("/attendance", requireAuth ("student"), studentController.getMyAttendance);

export default router;