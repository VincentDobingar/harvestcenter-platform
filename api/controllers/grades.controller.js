import db from '../config/db.js';
import PDFDocument from 'pdfkit';

/**
 * 👨‍🏫 Enseignant – Ajouter / modifier une note
 */
export const assignGrade = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { student_id, course_id, assignment_id, score, max_score, comment } = req.body;

    if (!student_id || !course_id || !score) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO grades (student_id, course_id, assignment_id, teacher_id, score, max_score, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
         score = VALUES(score), max_score = VALUES(max_score), comment = VALUES(comment)`,
      [student_id, course_id, assignment_id || null, teacherId, score, max_score || 100, comment || null]
    );

    res.json({ message: "Grade saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🎓 Étudiant – Voir ses notes
 */
export const getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [rows] = await db.query(
      `SELECT c.title AS course, a.title AS assignment, g.score, g.max_score, g.comment, g.created_at
       FROM grades g JOIN courses c ON c.id = g.course_id LEFT JOIN assignments a ON a.id = g.assignment_id
       WHERE g.student_id = ? ORDER BY g.created_at DESC`,
      [studentId]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 🧑‍💼 Admin / Enseignant – Notes par cours
 */
export const getGradesByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;

    const [rows] = await db.query(
      `SELECT CONCAT(s.first_name,' ',s.last_name) AS student, g.score, g.max_score, g.comment, a.title AS assignment
       FROM grades g JOIN students s ON s.id = g.student_id LEFT JOIN assignments a ON a.id = g.assignment_id
       WHERE g.course_id = ?`,
      [course_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * 📄 Export PDF notes étudiant
 */
export const exportGradesPDF = async (req, res) => {
  try {
    const studentId = req.user.id;

    const [grades] = await db.query(
      `SELECT c.title, g.score AS grade, g.comment FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.student_id = ?`,
      [studentId]
    );

    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=notes.pdf");

    doc.pipe(res);
    doc.fontSize(18).text("📄 Bulletin des notes", { align: "center" });
    doc.moveDown();

    grades.forEach(g => {
      doc.fontSize(12).text(`${g.title} : ${g.grade}`);
      if (g.comment) doc.text(`Commentaire : ${g.comment}`);
      doc.moveDown();
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: "PDF generation failed" });
  }
};
