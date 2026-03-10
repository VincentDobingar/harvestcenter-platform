// teacher.controller.js
import db from '../config/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

/* =========================================================
   📚 RÉCUPÉRER LES COURS DU FORMATEUR
========================================================= */
export async function getMyCourses(req, res) {
  try {
    const teacherId = req.user.id;

    const [courses] = await db.query(
      `SELECT c.*,
        (SELECT COUNT(*) FROM enrollments e 
         WHERE e.course_id = c.id AND e.status='approved') as students_count,
        (SELECT AVG(g.score)
         FROM grades g
         JOIN assignments a ON a.id = g.assignment_id
         WHERE a.course_id = c.id) as average_score
       FROM courses c
       WHERE c.teacher_id = ?`,
      [teacherId]
    );

    res.json(courses.map(course => ({
      ...course,
      students_count: Number(course.students_count || 0),
      average_score: Number(course.average_score || 0)
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur récupération cours' });
  }
}

/* =========================================================
   👨‍🎓 ÉTUDIANTS PAR COURS
========================================================= */
export async function getStudentsByCourse(req, res) {
  try {
    const { course_id } = req.params;
    const teacherId = req.user.id;

    const [[course]] = await db.query(
      'SELECT id FROM courses WHERE id=? AND teacher_id=?',
      [course_id, teacherId]
    );

    if (!course) return res.status(403).json({ message: 'Accès interdit' });

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
    res.status(500).json({ message: 'Server error' });
  }
}

/* =========================================================
   📝 CRÉER UN ASSIGNMENT
========================================================= */
export async function createAssignment(req, res) {
  try {
    const teacherId = req.user.id;
    const { course_id, title, description, deadline } = req.body;

    if (!course_id || !title || !deadline)
      return res.status(400).json({ message: 'Champs requis manquants' });

    const [[course]] = await db.query(
      'SELECT id FROM courses WHERE id=? AND teacher_id=?',
      [course_id, teacherId]
    );

    if (!course) return res.status(403).json({ message: 'Accès interdit' });

    await db.query(
      `INSERT INTO assignments (course_id, title, description, deadline, teacher_id)
       VALUES (?, ?, ?, ?, ?)`,
      [course_id, title, description || null, deadline, teacherId]
    );

    res.status(201).json({ message: 'Assignment créé' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
      `SELECT a.id
       FROM assignments a
       JOIN courses c ON c.id = a.course_id
       WHERE a.id=? AND c.teacher_id=?`,
      [assignment_id, teacherId]
    );

    if (!assignment) return res.status(403).json({ message: 'Accès interdit' });

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

    if (!student_id || !course_id || !date || !status)
      return res.status(400).json({ message: 'Champs requis manquants' });

    const [[course]] = await db.query(
      'SELECT id FROM courses WHERE id=? AND teacher_id=?',
      [course_id, teacherId]
    );

    if (!course) return res.status(403).json({ message: 'Accès interdit' });

    await db.query(
      `INSERT INTO attendance (student_id, course_id, teacher_id, date, status)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [student_id, course_id, teacherId, date, status]
    );

    res.json({ message: 'Présence enregistrée' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

/* =========================================================
   📊 EXPORT EXCEL STATISTIQUES
========================================================= */
export async function exportTeacherStatsExcel(req, res) {
  try {
    const teacherId = req.user.id;

    const [courses] = await db.query(
      `SELECT c.title,
              COUNT(DISTINCT e.student_id) as students,
              AVG(g.score) as avg_score
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id=c.id
       LEFT JOIN assignments a ON a.course_id=c.id
       LEFT JOIN grades g ON g.assignment_id=a.id
       WHERE c.teacher_id=?
       GROUP BY c.id`,
      [teacherId]
    );

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Statistics');

    sheet.columns = [
      { header: 'Cours', key: 'title' },
      { header: 'Étudiants', key: 'students' },
      { header: 'Moyenne', key: 'avg_score' }
    ];

    sheet.addRows(courses);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=teacher-stats.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur export Excel' });
  }
}