import db from "../config/db.js";

export async function adminStats(req, res) {

  const [[revenus]] = await db.query(`
    SELECT SUM(amount) AS total
    FROM payments
    WHERE status = 'success'
  `);

  const [[inscriptions]] = await db.query(`
    SELECT COUNT(*) AS total
    FROM inscriptions
    WHERE status = 'approved'
  `);

  const [[attendance]] = await db.query(`
    SELECT 
      COUNT(*) AS total,
      SUM(status = 'present') AS present
    FROM attendance
  `);

  res.json({
    revenus: revenus.total || 0,
    inscriptions: inscriptions.total || 0,
    presence_rate: attendance.total
      ? Math.round((attendance.present / attendance.total) * 100)
      : 0
  });
}


export const studentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const [rows] = await db.query(`
      SELECT c.title, g.score AS grade
      FROM grades g JOIN courses c ON g.course_id = c.id
      WHERE g.student_id = ?`, [studentId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
