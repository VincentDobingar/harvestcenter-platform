import db from "../config/db.js";

/* =====================================
   CREATE INSCRIPTION REQUEST
===================================== */
export const createInscriptionRequest = async (req, res) => {
  try {
    const data = req.body;

    await db.query(
      `INSERT INTO inscription_requests
      (
        session_id,
        module_id,
        course_id,
        niveau_id,
        time_slot_id,
        nom,
        prenom,
        sexe,
        date_naissance,
        lieu_naissance,
        telephone,
        whatsapp,
        email,
        quartier,
        arrondissement
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.session_id,
        data.module_id,     // formation
        data.course_id,     // cours
        data.niveau_id,     // classe
        data.time_slot_id,  // créneau
        data.nom,
        data.prenom,
        data.sexe,
        data.date_naissance,
        data.lieuNaissance,
        data.telephone,
        data.whatsapp,
        data.email,
        data.quartier,
        data.arrondissement,
      ]
    );

    return res.json({
      message: "Demande enregistrée",
    });
  } catch (err) {
    console.error("CREATE INSCRIPTION REQUEST ERROR:", err);
    return res.status(500).json({
      message: "Erreur serveur",
    });
  }
};

/* =====================================
   APPROVE INSCRIPTION
===================================== */
export const approveInscription = async (req, res) => {
  try {
    const { id } = req.params;

    const [[request]] = await db.query(
      "SELECT * FROM inscription_requests WHERE id = ?",
      [id]
    );

    if (!request) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    if (request.status === "approved") {
      return res.status(400).json({ message: "Déjà validée" });
    }

    const [studentResult] = await db.query(
      `INSERT INTO students
      (
        session_id,
        module_id,
        course_id,
        niveau_id,
        time_slot_id,
        nom,
        prenom,
        email
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        request.session_id,
        request.module_id,
        request.course_id,
        request.niveau_id,
        request.time_slot_id,
        request.nom,
        request.prenom,
        request.email,
      ]
    );

    const studentId = studentResult.insertId;

    await db.query(
      `INSERT INTO payments (student_id, amount, status)
       VALUES (?, ?, 'pending')`,
      [studentId, 50000]
    );

    await db.query(
      "UPDATE inscription_requests SET status = 'approved' WHERE id = ?",
      [id]
    );

    return res.json({
      message: "Inscription validée avec succès",
    });
  } catch (err) {
    console.error("APPROVE INSCRIPTION ERROR:", err);
    return res.status(500).json({
      message: "Erreur validation inscription",
    });
  }
};

/* =====================================
   OPTIONS - ACADEMIC SESSIONS
===================================== */
export const getAcademicSessionsOptions = async (req, res) => {
  try {
    const [sessions] = await db.query(`
      SELECT id, name AS label
      FROM academic_sessions
      WHERE status = 'open'
      ORDER BY start_date DESC, id DESC
    `);

    return res.json({ sessions });
  } catch (err) {
    console.error("ACADEMIC SESSIONS OPTIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================================
   OPTIONS - FORMATIONS
===================================== */
export const getFormationsOptions = async (req, res) => {
  try {
    const [formations] = await db.query(`
      SELECT id, title AS label
      FROM formations
      ORDER BY title ASC
    `);

    return res.json({ formations });
  } catch (err) {
    console.error("FORMATIONS OPTIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================================
   OPTIONS - COURSES BY FORMATION
===================================== */
export const getCoursesOptionsByFormation = async (req, res) => {
  try {
    const { formationId } = req.params;

    const [courses] = await db.query(
      `
      SELECT id, title AS label
      FROM courses
      WHERE formation_id = ?
      ORDER BY title ASC
      `,
      [formationId]
    );

    return res.json({ courses });
  } catch (err) {
    console.error("COURSES OPTIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================================
   OPTIONS - CLASSES BY COURSE
===================================== */
export const getClassesOptionsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [classes] = await db.query(
      `
      SELECT
        cl.id,
        CONCAT(cl.name, ' - ', COALESCE(cl.level, 'Niveau')) AS label
      FROM classes cl
      INNER JOIN courses c ON c.class_id = cl.id
      WHERE c.id = ?
      ORDER BY cl.name ASC, cl.level ASC
      `,
      [courseId]
    );

    return res.json({ classes });
  } catch (err) {
    console.error("CLASSES OPTIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

/* =====================================
   OPTIONS - TIMESLOTS BY CLASS + COURSE
===================================== */
export const getTimeSlotsOptionsByClassAndCourse = async (req, res) => {
  try {
    const { classId, courseId } = req.params;

    const [timeSlots] = await db.query(
      `
      SELECT
        id,
        CONCAT(
          day,
          ' ',
          TIME_FORMAT(start_time, '%H:%i'),
          ' - ',
          TIME_FORMAT(end_time, '%H:%i'),
          CASE
            WHEN room IS NOT NULL AND room <> '' THEN CONCAT(' / Salle ', room)
            ELSE ''
          END
        ) AS label
      FROM timetables
      WHERE class_id = ? AND course_id = ?
      ORDER BY
        FIELD(day, 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'),
        start_time ASC
      `,
      [classId, courseId]
    );

    return res.json({ timeSlots });
  } catch (err) {
    console.error("TIMESLOTS OPTIONS ERROR:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};