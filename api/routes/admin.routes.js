// api/routes/admin.routes.js
import express from "express";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import * as adminController from "../controllers/admin.controller.js";

const router = express.Router();

// 🔐 Protection globale
router.use(requireAuth);
router.use(requireRole("admin"));

/* ===================== SCHOLARSHIPS ===================== */
router.get("/scholarship", adminController.getScholarships);
router.post("/scholarship", adminController.createScholarship);
router.post("/students/fees", adminController.assignScholarshipAndFees);

/* ===================== TEACHERS ===================== */
router.post("/teachers", adminController.createTeacher);
router.get("/teachers", adminController.getTeachers);
router.post("/teachers/:id/assign-class", adminController.assignTeacherToClass);
router.delete("/teachers/:id/classes/:classId", adminController.removeTeacherClassAssignment);
router.post("/teachers/:id/assign-subject", adminController.assignTeacherToSubject);
router.delete("/teachers/:id/subjects/:subjectId", adminController.removeTeacherSubjectAssignment);
router.post("/teachers/:id/assign-course", adminController.assignTeacherToCourse);
router.delete("/teachers/:id/courses/:courseId", adminController.removeTeacherCourseAssignment);

/* ===================== CLASSES ===================== */
router.post("/classes", adminController.createClass);
router.get("/classes", adminController.getClasses);

/* ===================== COURSES ===================== */
router.get("/courses", adminController.getCoursesList);

/* ===================== SUBJECTS ===================== */
router.get("/subjects", adminController.getSubjectsList);
router.post("/subjects", adminController.createSubject);

/* ===================== TIMETABLES ===================== */
router.post("/timetables", adminController.createTimetable);
router.get("/timetables", adminController.getTimetables);
router.delete("/timetables/:id", adminController.deleteTimetable);

/* ===================== ANNOUNCEMENTS ===================== */
router.post("/announcements", adminController.createAnnouncement);
router.get("/announcements", adminController.getAnnouncements);

/* ===================== INSCRIPTION REQUESTS ===================== */
router.get("/inscription-requests", adminController.getInscriptionRequests);
router.patch("/inscription-requests/:id/status", adminController.updateInscriptionRequestStatus);
router.patch("/inscription-requests/:id/payment", adminController.updateInscriptionRequestPayment);

/* ===================== STUDENTS ===================== */
router.get("/students", adminController.getStudents);
router.get("/students/:id", adminController.getStudentById);
router.patch("/students/:id/payment", adminController.updateStudentPayment);

/* ===================== USERS ===================== */
router.post("/users", adminController.createUser);
router.get("/users", adminController.getUsers);
router.delete("/users/:id", adminController.deleteUser);
router.patch("/users/:id/role", adminController.updateUserRole);

/* ===================== STATS & SECURITY ===================== */
router.get("/stats", adminController.getAdminStats);
router.get("/security-dashboard", adminController.getSecurityDashboard);

export default router;
