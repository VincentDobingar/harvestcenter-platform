import db from "../config/db.js";
import bcrypt from "bcryptjs";

/* =====================================================
   🎓 SCHOLARSHIPS
===================================================== */

export const getScholarships = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, description, discount_percent, status, created_at 
      FROM scholarships 
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET SCHOLARSHIPS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createScholarship = async (req, res) => {
  try {
    const { name, description, discount_percent } = req.body;

    if (!name || discount_percent == null) {
      return res.status(400).json({
        message: "Name and discount_percent required"
      });
    }

    if (discount_percent < 0 || discount_percent > 100) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100"
      });
    }

    await db.query(
      "INSERT INTO scholarships (name, description, discount_percent) VALUES (?, ?, ?)",
      [name.trim(), description || null, discount_percent]
    );

    res.status(201).json({ message: "Scholarship created successfully" });

  } catch (err) {
    console.error("CREATE SCHOLARSHIP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   💰 ASSIGN SCHOLARSHIP & FEES (TRANSACTION SAFE)
===================================================== */

export const assignScholarshipAndFees = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const { student_id, scholarship_id, registration_fee } = req.body;

    if (!student_id || !registration_fee) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (registration_fee <= 0) {
      return res.status(400).json({ message: "Invalid registration fee" });
    }

    await connection.beginTransaction();

    let discountPercent = 0;

    if (scholarship_id) {
      const [[scholarship]] = await connection.query(
        "SELECT discount_percent FROM scholarships WHERE id=? AND status='active'",
        [scholarship_id]
      );

      if (!scholarship) {
        await connection.rollback();
        return res.status(404).json({ message: "Scholarship not found" });
      }

      discountPercent = scholarship.discount_percent;
    }

    const finalFee = registration_fee - (registration_fee * discountPercent / 100);

    await connection.query(`
      UPDATE students
      SET scholarship_id=?, registration_fee=?, final_fee=?
      WHERE id=?
    `, [scholarship_id || null, registration_fee, finalFee, student_id]);

    await connection.commit();

    // 🔔 SOCKET
    const io = req.app.get("io");
    io?.to("admins").emit("admin:update", {
      type: "scholarship_assigned",
      student_id,
      timestamp: Date.now()
    });

    res.json({
      message: "Scholarship & fees assigned",
      registration_fee,
      discountPercent,
      final_fee: finalFee
    });

  } catch (err) {
    await connection.rollback();
    console.error("ASSIGN SCHOLARSHIP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    connection.release();
  }
};

/* =====================================================
   👨‍🏫 CREATE TEACHER
===================================================== */

export const createTeacher = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(`
      INSERT INTO users (first_name, last_name, email, password, role, status)
      VALUES (?, ?, ?, ?, 'teacher', 'active')
    `, [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase(),
      hashedPassword
    ]);

    const io = req.app.get("io");
    io?.to("admins").emit("admin:update", {
      type: "teacher_created",
      timestamp: Date.now()
    });

    res.status(201).json({ message: "Teacher created successfully" });

  } catch (err) {
    console.error("CREATE TEACHER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   🏫 CLASSES
===================================================== */

export const createClass = async (req, res) => {
  try {
    const { name, level, academic_year } = req.body;

    if (!name || !level || !academic_year) {
      return res.status(400).json({ message: "All fields required" });
    }

    await db.query(`
      INSERT INTO classes (name, level, academic_year)
      VALUES (?, ?, ?)
    `, [name.trim(), level, academic_year]);

    res.status(201).json({ message: "Class created successfully" });

  } catch (err) {
    console.error("CREATE CLASS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getClasses = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name, level, academic_year 
      FROM classes 
      ORDER BY id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET CLASSES ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📅 TIMETABLES
===================================================== */

export const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM timetables WHERE id=?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    res.json({ message: "Timetable deleted" });

  } catch (err) {
    console.error("DELETE TIMETABLE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📢 ANNOUNCEMENTS
===================================================== */

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, target_type, target_id } = req.body;

    if (!title || !content || !target_type) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await db.query(`
      INSERT INTO announcements
      (title, content, target_type, target_id, created_by)
      VALUES (?, ?, ?, ?, ?)
    `, [
      title.trim(),
      content,
      target_type,
      target_type === "global" ? null : target_id,
      req.user.id
    ]);

    res.status(201).json({ message: "Announcement published successfully" });

  } catch (err) {
    console.error("CREATE ANNOUNCEMENT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   📊 ADMIN STATS (Optimisé)
===================================================== */

export const getAdminStats = async (req, res) => {
  try {

    const [[students]] = await db.query(
      "SELECT COUNT(*) AS total FROM users WHERE role='student'"
    );

    const [[courses]] = await db.query(
      "SELECT COUNT(*) AS total FROM courses"
    );

    const [[revenue]] = await db.query(
      "SELECT IFNULL(SUM(amount),0) AS total FROM payments WHERE status='success'"
    );

    res.json({
      students: students.total,
      courses: courses.total,
      revenue: revenue.total
    });

  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    res.status(500).json({ message: "Erreur stats admin" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { first_name, last_name, email, password, role } = req.body;

    if (!first_name || !last_name || !email || !password || !role) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    // Rôles autorisés à être créés par admin
    const allowedRoles = ["student", "teacher", "secretaire", "finance", "admin"];

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Vous ne pouvez pas créer ce type d'utilisateur"
      });
    }

    // Empêcher admin de créer superadmin
    if (role === "superadmin") {
      return res.status(403).json({
        message: "Création superadmin interdite"
      });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Email déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(`
      INSERT INTO users (first_name, last_name, email, password, role, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `, [
      first_name.trim(),
      last_name.trim(),
      email.toLowerCase(),
      hashedPassword,
      role
    ]);

    res.status(201).json({ message: "Utilisateur créé avec succès" });

  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUsers = async (req, res) => {
  try {

    const [users] = await db.query(`
      SELECT id, first_name, last_name, email, role, status, created_at
      FROM users
      ORDER BY created_at DESC
    `);

    res.json(users);

  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération utilisateurs" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Empêcher suppression de soi-même
    if (parseInt(id) === req.user.id) {
      return res.status(403).json({
        message: "Vous ne pouvez pas supprimer votre propre compte"
      });
    }

    const [[user]] = await db.query(
      "SELECT role FROM users WHERE id = ?",
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Empêcher suppression superadmin
    if (user.role === "superadmin") {
      return res.status(403).json({
        message: "Impossible de supprimer un superadmin"
      });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ message: "Utilisateur supprimé avec succès" });

  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role requis" });
    }

    const hierarchy = {
      superadmin: 4,
      admin: 3,
      finance: 2,
      secretaire: 2,
      teacher: 1,
      student: 0
    };

    const requesterLevel = hierarchy[req.user.role] || 0;
    const targetLevel = hierarchy[role] || 0;

    // Empêcher élévation au-dessus de soi
    if (targetLevel >= requesterLevel) {
      return res.status(403).json({
        message: "Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre"
      });
    }

    const [[targetUser]] = await db.query(
      "SELECT role FROM users WHERE id=?",
      [id]
    );

    if (!targetUser) {
      return res.status(404).json({ message: "Utilisateur introuvable" });
    }

    // Empêcher modification superadmin
    if (targetUser.role === "superadmin") {
      return res.status(403).json({
        message: "Impossible de modifier un superadmin"
      });
    }

    await db.query(
      "UPDATE users SET role=? WHERE id=?",
      [role, id]
    );

    res.json({ message: "Rôle mis à jour avec succès" });

  } catch (err) {
    console.error("UPDATE ROLE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getSecurityDashboard = async (req, res) => {
  try {

    const [[failedLogins]] = await db.query(`
      SELECT COUNT(*) as total
      FROM login_attempts
      WHERE success = FALSE
      AND created_at >= NOW() - INTERVAL 24 HOUR
    `);

    const [[activeSessions]] = await db.query(`
      SELECT COUNT(*) as total
      FROM sessions
      WHERE expires_at > NOW()
    `);

    const [[suspiciousIPs]] = await db.query(`
      SELECT COUNT(DISTINCT ip_address) as total
      FROM login_attempts
      WHERE success = FALSE
      AND created_at >= NOW() - INTERVAL 1 DAY
      GROUP BY ip_address
      HAVING COUNT(*) > 5
      LIMIT 1
    `);

    const [recentAudit] = await db.query(`
      SELECT a.id, a.action, a.entity, a.ip_address, a.created_at,
             CONCAT(u.first_name,' ',u.last_name) as user
      FROM audit_logs a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    const [recentUsers] = await db.query(`
      SELECT id, first_name, last_name, role, created_at
      FROM users
      WHERE created_at >= NOW() - INTERVAL 7 DAY
      ORDER BY created_at DESC
    `);

    res.json({
      failedLogins24h: failedLogins.total,
      activeSessions: activeSessions.total,
      suspiciousIPs: suspiciousIPs?.total || 0,
      recentAudit,
      recentUsers
    });

  } catch (err) {
    console.error("SECURITY DASHBOARD ERROR:", err);
    res.status(500).json({ message: "Erreur dashboard sécurité" });
  }
};

export const getStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT id, first_name, last_name, email, status, created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `);

    res.json(students);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération étudiants" });
  }
};

export const createTimetable = async (req, res) => {
  try {
    const { class_id, subject, day, start_time, end_time } = req.body;

    if (!class_id || !subject || !day || !start_time || !end_time) {
      return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    await db.query(`
      INSERT INTO timetables (class_id, subject, day, start_time, end_time)
      VALUES (?, ?, ?, ?, ?)
    `, [class_id, subject, day, start_time, end_time]);

    res.status(201).json({ message: "Emploi du temps créé avec succès" });

  } catch (err) {
    console.error("CREATE TIMETABLE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getTimetables = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, c.name as class_name
      FROM timetables t
      LEFT JOIN classes c ON c.id = t.class_id
      ORDER BY t.id DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET TIMETABLES ERROR:", err);
    res.status(500).json({ message: "Erreur récupération emplois du temps" });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT a.*, CONCAT(u.first_name,' ',u.last_name) as author
      FROM announcements a
      LEFT JOIN users u ON u.id = a.created_by
      ORDER BY a.created_at DESC
    `);

    res.json(rows);

  } catch (err) {
    console.error("GET ANNOUNCEMENTS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération annonces" });
  }
};
