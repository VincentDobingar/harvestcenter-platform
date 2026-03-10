import db from "../config/db.js";

export const getAssignments = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    // 🔹 ADMIN → tout voir
    if (role === "admin") {
      const [rows] = await db.query(`
        SELECT 
          a.id,
          a.title,
          a.description,
          a.deadline,
          c.title AS course_title
        FROM assignments a
        JOIN courses c ON c.id = a.course_id
        ORDER BY a.deadline ASC
      `);

      return res.json(rows);
    }

    // 🔹 STUDENT → filtré par classe
    if (role === "student") {
      // 1️⃣ Récupérer class_id
      const [studentRows] = await db.query(
        "SELECT class_id FROM students WHERE user_id = ?",
        [userId]
      );

      if (studentRows.length === 0) {
        return res.status(404).json({ message: "Étudiant non trouvé" });
      }

      const classId = studentRows[0].class_id;

      // 2️⃣ Récupérer les devoirs liés aux cours de sa classe
      const [assignments] = await db.query(
        `
        SELECT 
          a.id,
          a.title,
          a.description,
          a.deadline,
          c.title AS course_title
        FROM assignments a
        JOIN courses c ON c.id = a.course_id
        WHERE c.class_id = ?
        ORDER BY a.deadline ASC
        `,
        [classId]
      );

      return res.json(assignments);
    }

    // 🔹 TEACHER → seulement ses cours
    if (role === "teacher") {
      const [assignments] = await db.query(
        `
        SELECT 
          a.id,
          a.title,
          a.description,
          a.deadline,
          c.title AS course_title
        FROM assignments a
        JOIN courses c ON c.id = a.course_id
        WHERE c.teacher_id = ?
        ORDER BY a.deadline ASC
        `,
        [userId]
      );

      return res.json(assignments);
    }

    return res.status(403).json({ message: "Accès refusé" });

  } catch (err) {
    console.error("ASSIGNMENTS ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
