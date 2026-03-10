import db from '../config/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
//import PDFDocument from "pdfkit";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock fee calculator
const calculateFinalFee = (registration_fee, discountPercent) => registration_fee - (registration_fee * discountPercent / 100);

export const dashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const [studentRows] = await db.query(`
      SELECT s.id AS student_id, u.id AS user_id, u.email, s.address, s.city, s.country, s.phone_call, 
             s.phone_whatsapp, s.language, s.class_id, s.registration_fee, s.final_fee,
             sc.name AS scholarship, sc.discount_percent
      FROM students s JOIN users u ON u.id = s.user_id LEFT JOIN scholarships sc ON sc.id = s.scholarship_id
      WHERE u.id = ?`, [userId]);

    if (!studentRows.length) return res.status(404).json({ message: "Student not found" });
    const student = studentRows[0];

    const [courses] = await db.query(`
      SELECT DISTINCT c.id, c.title, c.description
      FROM timetables tt JOIN courses c ON c.id = tt.course_id
      WHERE tt.class_id = ?`, [student.class_id]);

    // 3️⃣ Récupérer annonces
    const [announcements] = await db.query(
      `SELECT a.*, c.title AS course_title
       FROM announcements a
       JOIN courses c ON c.id = a.course_id
       WHERE c.class_id = ?
       ORDER BY a.created_at DESC`,
      [student.class_id]
    );

      // 4️⃣ 👉 Dashboards stats
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(a.id) AS total,
        SUM(CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END) AS submitted,
        SUM(CASE WHEN sub.id IS NULL AND a.deadline >= NOW() THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN sub.id IS NULL AND a.deadline < NOW() THEN 1 ELSE 0 END) AS late
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      LEFT JOIN submissions sub 
        ON sub.assignment_id = a.id 
        AND sub.student_id = ?
      WHERE c.class_id = ?
    `, [student.student_id, student.class_id]);

    const completionRate =
      stats.total > 0
        ? Math.round((stats.submitted / stats.total) * 100)
        : 0;

    // 5️⃣ Retourner tout
    res.json({
      student,
      courses,
      announcements,
      stats: {
        total: stats?.total || 0,
        submitted: stats?.submitted || 0,
        pending: stats?.pending || 0,
        late: stats?.late || 0
      },
      completionRate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const assignScholarshipAndFees = async (req, res) => {
  try {
    const { student_id, scholarship_id, registration_fee } = req.body;
    if (!student_id || !registration_fee) return res.status(400).json({ message: "Missing required fields" });
    if (registration_fee <= 0) return res.status(400).json({ message: "Invalid registration fee" });

    let discountPercent = 0;
    if (scholarship_id) {
      const [[scholarship]] = await db.query("SELECT discount_percent FROM scholarships WHERE id = ? AND status = 'active'", [scholarship_id]);
      if (!scholarship) return res.status(400).json({ message: "Invalid scholarship" });
      discountPercent = scholarship.discount_percent;
    }

    const finalFee = calculateFinalFee(registration_fee, discountPercent);
    await db.query("UPDATE students SET scholarship_id = ?, registration_fee = ?, final_fee = ? WHERE id = ?", [scholarship_id || null, registration_fee, finalFee, student_id]);

    res.json({ message: "Scholarship & fees assigned successfully", registration_fee, discountPercent, final_fee: finalFee });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitAssignment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignment_id } = req.params;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    // 1️⃣ récupérer student
    const [[student]] = await db.query(
      "SELECT id FROM students WHERE user_id = ?",
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // 2️⃣ récupérer assignment + deadline
    const [[assignment]] = await db.query(
      "SELECT deadline FROM assignments WHERE id = ?",
      [assignment_id]
    );

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    const now = new Date();
    const deadline = new Date(assignment.deadline);

    if (now > deadline) {
      return res.status(400).json({ 
        message: "Deadline has passed. Submission not allowed." 
      });
    }

    // 3️⃣ vérifier double soumission
    const [existing] = await db.query(
      "SELECT id FROM submissions WHERE assignment_id=? AND student_id=?",
      [assignment_id, student.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Assignment already submitted" });
    }

    // 4️⃣ déplacer fichier
    const targetPath = path.join(__dirname, "../uploads", file.filename);
    await fs.rename(file.path, targetPath);

    await db.query(
      "INSERT INTO submissions (assignment_id, student_id, file_path, status) VALUES (?, ?, ?, 'submitted')",
      [assignment_id, student.id, targetPath]
    );

    res.json({ message: "Assignment submitted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAssignments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [[student]] = await db.query(
      "SELECT id, class_id FROM students WHERE user_id = ?",
      [userId]
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const [assignments] = await db.query(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.deadline,
        c.title AS course_title,
        CASE
          WHEN sub.id IS NOT NULL THEN 'submitted'
          WHEN a.deadline < NOW() THEN 'late'
          ELSE 'pending'
        END AS submission_status
      FROM assignments a
      JOIN courses c ON c.id = a.course_id
      WHERE c.class_id = ?
      LEFT JOIN submissions sub 
        ON sub.assignment_id = a.id 
        AND sub.student_id = ?
      ORDER BY a.deadline ASC
    `, [student.class_id, student.id]);

    res.json(assignments);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyGrades = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [grades] = await db.query(`SELECT g.id, c.title AS course, g.score, g.comment FROM grades g JOIN courses c ON g.course_id = c.id WHERE g.student_id = ?`, [studentId]);
    res.json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [attendance] = await db.query(`SELECT a.id, c.title AS course, a.date, a.status FROM attendance a JOIN courses c ON a.course_id = c.id WHERE a.student_id = ?`, [studentId]);
    res.json(attendance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getRanking = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(`
      SELECT s.id, u.full_name, AVG(g.score) AS average_score
      FROM students s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN grades g ON g.student_id = s.id
      WHERE s.class_id = (SELECT class_id FROM students WHERE user_id = ?)
      GROUP BY s.id
      ORDER BY average_score DESC
    `, [userId]);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
