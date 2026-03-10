import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

// 🔐 Protection globale
router.use(requireAuth);
router.use(requireRole("admin"));

//router.get("/dashboard", requireAuth, requireRole("admin"), adminController.dashboard);
router.get("/scholarship", adminController.getScholarships);
router.post("/scholarship", adminController.createScholarship);
router.post("/students/fees", adminController.assignScholarshipAndFees);
router.post("/teachers", adminController.createTeacher);
router.post("/classes", adminController.createClass);
router.get("/classes", adminController.getClasses);
router.post("/timetables", adminController.createTimetable);
router.get("/timetables", adminController.getTimetables);
router.delete("/timetables/:id", adminController.deleteTimetable);
router.post("/announcements", adminController.createAnnouncement);
router.get("/announcements", adminController.getAnnouncements);
router.get("/stats", adminController.getAdminStats);

export default router;