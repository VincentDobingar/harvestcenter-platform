// api/controllers/teacher.controller.js
import db from '../config/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

async function teacherOwnsCourse(teacherUserId, courseId) {
  const [[row]] = await db.query(
    `
    SELECT c.id
    FROM courses c
    LEFT JOIN teachers t
      ON t.user_id = ?
    LEFT JOIN teacher_course_assignments tca
      ON tca.teacher_id = t.id
     AND tca.course_id = c.id
    WHERE c.id = ?
      AND (
        c.teacher_id = ?
        OR tca.id IS NOT NULL
      )
    LIMIT 1
    `,
    [teacherUserId, courseId, teacherUserId]
  );

  return !!row;
}

/* =========================================================
   📚 RÉCUPÉRER LES COURS DU FORMATEUR
========================================================= */
export async function getMyCourses(req, res) {
  try {
    const teacherUserId = req.user.id;

    const [courses] = await db.query(
      `
      SELECT DISTINCT
        c.id,
        c.title,
        c.description,
        c.teacher_id,
        c.created_at,
        0 AS students_count,
        0 AS average_grade
      FROM courses c
      LEFT JOIN teachers t
        ON t.user_id = ?
      LEFT JOIN teacher_course_assignments tca
        ON tca.teacher_id = t.id
       AND tca.course_id = c.id
      WHERE c.teacher_id = ?
         OR tca.id IS NOT NULL
      ORDER BY c.created_at DESC
      `,
      [teacherUserId, teacherUserId]
    );

    res.json(
      courses.map((course) => ({
        ...course,
        students_count: Number(course.students_count || 0),
        average_grade: Number(course.average_grade || 0),
      }))
    );
  } catch (err) {
    console.error("getMyCourses error:", err);
    res.status(500).json({ message: "Erreur récupération cours" });
  }
}

/* =========================================================
   👨‍🎓 ÉTUDIANTS PAR COURS
========================================================= */
export async function getStudentsByCourse(req, res) {
  try {
    const { course_id } = req.params;
    const teacherId = req.user.id;

    const allowed = await teacherOwnsCourse(teacherId, course_id);
    if (!allowed) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    const [students] = await db.query(
      `SELECT s.id, s.first_name, s.last_name, s.class_id
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.course_id = ? AND e.status='approved'`,
      [course_id]
    );

    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📝 CRÉER UN ASSIGNMENT
========================================================= */
export async function createAssignment(req, res) {
  try {
    const teacherId = req.user.id;
    const { course_id, title, description, deadline } = req.body;

    if (!course_id || !title || !deadline) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const allowed = await teacherOwnsCourse(teacherId, course_id);
    if (!allowed) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await db.query(
      `INSERT INTO assignments (course_id, title, description, deadline, teacher_id)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, title, description || null, deadline, teacherId]
    );

    res.status(201).json({ message: "Assignment créé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   🏆 AJOUTER NOTE
========================================================= */
export async function addGrade(req, res) {
  try {
    const { student_id, assignment_id, score, comment } = req.body;
    const teacherId = req.user.id;

    if (!student_id || !assignment_id || score === undefined)
      return res.status(400).json({ message: 'Champs requis manquants' });

    const [[assignment]] = await db.query(
      `SELECT a.id, a.course_id
      FROM assignments a
      WHERE a.id = ?
      LIMIT 1`,
      [assignment_id]
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment introuvable" });
    }

    const allowed = await teacherOwnsCourse(teacherId, assignment.course_id);
    if (!allowed) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await db.query(
      `INSERT INTO grades (student_id, assignment_id, score, comment)
       VALUES (?, ?, ?, ?)`,
      [student_id, assignment_id, score, comment || null]
    );

    res.json({ message: 'Note ajoutée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/* =========================================================
   📅 MARQUER PRÉSENCE
========================================================= */
export async function markAttendance(req, res) {
  try {
    const { student_id, course_id, date, status } = req.body;
    const teacherId = req.user.id;

    if (!student_id || !course_id || !date || !status) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const allowed = await teacherOwnsCourse(teacherId, course_id);
    if (!allowed) {
      return res.status(403).json({ message: "Accès interdit" });
    }

    await db.query(
      `INSERT INTO attendance (student_id, course_id, teacher_id, date, status)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [student_id, course_id, teacherId, date, status]
    );

    res.json({ message: "Présence enregistrée" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

/* =========================================================
   📊 EXPORT EXCEL STATISTIQUES
========================================================= */
export async function exportTeacherStatsExcel(req, res) {
  try {
    const teacherUserId = req.user.id;

    const [courses] = await db.query(
      `
      SELECT
        c.title,
        COUNT(DISTINCT e.student_id) AS students,
        AVG(g.score) AS avg_score
      FROM courses c
      LEFT JOIN teachers t
        ON t.user_id = ?
      LEFT JOIN teacher_course_assignments tca
        ON tca.teacher_id = t.id
       AND tca.course_id = c.id
      LEFT JOIN enrollments e
        ON e.course_id = c.id
      LEFT JOIN assignments a
        ON a.course_id = c.id
      LEFT JOIN grades g
        ON g.assignment_id = a.id
      WHERE c.teacher_id = ?
         OR tca.id IS NOT NULL
      GROUP BY c.id, c.title
      ORDER BY c.title ASC
      `,
      [teacherUserId, teacherUserId]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Statistics");

    sheet.columns = [
      { header: "Cours", key: "title" },
      { header: "Étudiants", key: "students" },
      { header: "Moyenne", key: "avg_score" },
    ];

    sheet.addRows(courses);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=teacher-stats.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur export Excel" });
  }
}

export async function getTeacherDashboardStats(req, res) {
  try {
    const teacherUserId = req.user.id;

    const [courses] = await db.query(
      `
      SELECT DISTINCT c.id
      FROM courses c
      LEFT JOIN teachers t
        ON t.user_id = ?
      LEFT JOIN teacher_course_assignments tca
        ON tca.teacher_id = t.id
       AND tca.course_id = c.id
      WHERE c.teacher_id = ?
         OR tca.id IS NOT NULL
      `,
      [teacherUserId, teacherUserId]
    );

    return res.json({
      totalCourses: Number(courses.length || 0),
      totalStudents: 0,
      averageGrade: 0,
      totalRevenue: 0,
    });
  } catch (err) {
    console.error("getTeacherDashboardStats error:", err);
    return res.status(500).json({ message: "Erreur stats dashboard" });
  }
}

export async function getTeacherChartStats(req, res) {
  try {
    const teacherUserId = req.user.id;

    const [courses] = await db.query(
      `
      SELECT DISTINCT
        c.id,
        c.title,
        0 AS avg_grade
      FROM courses c
      LEFT JOIN teachers t
        ON t.user_id = ?
      LEFT JOIN teacher_course_assignments tca
        ON tca.teacher_id = t.id
       AND tca.course_id = c.id
      WHERE c.teacher_id = ?
         OR tca.id IS NOT NULL
      ORDER BY c.created_at DESC
      `,
      [teacherUserId, teacherUserId]
    );

    return res.json(courses);
  } catch (err) {
    console.error("getTeacherChartStats error:", err);
    return res.status(500).json({ message: "Erreur chart stats" });
  }
}

export async function getTeacherNotifications(req, res) {
  try {
    return res.json([]);
  } catch (err) {
    console.error("getTeacherNotifications error:", err);
    return res.status(500).json({ message: "Erreur notifications" });
  }
}