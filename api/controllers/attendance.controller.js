import db from '../config/db.js';

export const markAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { student_id, course_id, date, status, comment } = req.body;
    if (!student_id || !course_id || !date || !status) return res.status(400).json({ message: "Missing required fields" });

    await db.query(`INSERT INTO attendance (student_id, course_id, teacher_id, date, status, comment) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
      status = VALUES(status), comment = VALUES(comment)`, [student_id, course_id, teacherId, date, status, comment || null]);
    res.json({ message: "Attendance saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await db.query(`SELECT a.date, a.status, c.title AS course FROM attendance a JOIN courses c ON c.id = a.course_id WHERE a.student_id = ? ORDER BY a.date DESC`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttendanceByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const [rows] = await db.query(`SELECT CONCAT(s.first_name,' ',s.last_name) AS student, a.date, a.status, a.comment
      FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.course_id = ? ORDER BY a.date DESC`, [course_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
