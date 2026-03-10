export const checkAcademicRisk = async () => {
  const [students] = await db.query(`
    SELECT s.id, u.email, s.phone_whatsapp
    FROM students s
    JOIN users u ON u.id = s.user_id
  `);

  for (const student of students) {
    const [[stats]] = await db.query(`
      SELECT 
        COUNT(a.id) AS total,
        SUM(CASE WHEN sub.id IS NOT NULL THEN 1 ELSE 0 END) AS submitted
      FROM assignments a
      LEFT JOIN submissions sub 
        ON sub.assignment_id = a.id 
        AND sub.student_id = ?
    `, [student.id]);

    const completionRate =
      stats.total > 0
        ? Math.round((stats.submitted / stats.total) * 100)
        : 0;

    if (completionRate < 50) {
      await sendRiskEmail(student.email, completionRate);

      if (student.phone_whatsapp) {
        await sendWhatsAppAlert(student.phone_whatsapp, completionRate);
      }
    }
  }
};
