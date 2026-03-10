import express from "express";
import * as inscriptionController from "../controllers/inscription.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/options/sessions", inscriptionController.getAcademicSessionsOptions);
router.get("/options/formations", inscriptionController.getFormationsOptions);
router.get("/options/courses/:formationId", inscriptionController.getCoursesOptionsByFormation);
router.get("/options/classes/:courseId", inscriptionController.getClassesOptionsByCourse);
router.get("/options/timeslots/:classId/:courseId", inscriptionController.getTimeSlotsOptionsByClassAndCourse);

router.post("/request", requireAuth("student"), inscriptionController.createInscriptionRequest);

router.put(
  "/approve/:id",
  requireAuth("admin", "superadmin"),
  inscriptionController.approveInscription
);

export default router;