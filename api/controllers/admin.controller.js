// api/controllers/admin.controller.js
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
    const { first_name, last_name, email, password, specialization, phone } = req.body;

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

    const [userResult] = await db.query(
      `INSERT INTO users (first_name, last_name, email, password, role, status)
       VALUES (?, ?, ?, ?, 'teacher', 'active')`,
      [
        first_name.trim(),
        last_name.trim(),
        email.toLowerCase(),
        hashedPassword
      ]
    );

    await db.query(
      `INSERT INTO teachers (user_id, specialization, phone)
       VALUES (?, ?, ?)`,
      [userResult.insertId, specialization || null, phone || null]
    );

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
    const [[usersStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalUsers,
        SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
        SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) AS teachers
      FROM users
    `);

    const [[classesStats]] = await db.query(`
      SELECT COUNT(*) AS classes
      FROM classes
    `);

    const [[coursesStats]] = await db.query(`
      SELECT COUNT(*) AS courses
      FROM courses
    `);

    const [[requestsStats]] = await db.query(`
      SELECT
        COUNT(*) AS totalRequests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pendingRequests,
        SUM(CASE WHEN status IN ('validated', 'enrolled') THEN 1 ELSE 0 END) AS validatedRequests
      FROM inscription_requests
    `);

    const [[paymentStats]] = await db.query(`
      SELECT
        SUM(
          CASE
            WHEN COALESCE((
              SELECT ir.accept_fees
              FROM inscription_requests ir
              WHERE ir.user_id = u.id OR ir.email = u.email
              ORDER BY ir.id DESC
              LIMIT 1
            ), 0) = 1 THEN 1
            ELSE 0
          END
        ) AS paidStudents,
        SUM(
          CASE
            WHEN COALESCE((
              SELECT ir.accept_fees
              FROM inscription_requests ir
              WHERE ir.user_id = u.id OR ir.email = u.email
              ORDER BY ir.id DESC
              LIMIT 1
            ), 0) = 0 THEN 1
            ELSE 0
          END
        ) AS unpaidStudents
      FROM users u
      WHERE u.role = 'student'
    `);

    const [[revenueStats]] = await db.query(`
      SELECT IFNULL(SUM(amount), 0) AS revenue
      FROM payments
      WHERE status = 'success'
    `);

    const [monthlyRows] = await db.query(`
      SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS monthKey,
        DATE_FORMAT(created_at, '%b %Y') AS monthLabel,
        COUNT(*) AS count
      FROM inscription_requests
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%b %Y')
      ORDER BY monthKey ASC
    `);

    const monthlyMap = new Map(
      monthlyRows.map((row) => [
        row.monthKey,
        {
          month: row.monthLabel,
          count: Number(row.count || 0),
        },
      ])
    );

    const monthlyRegistrations = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const key = `${year}-${month}`;

      if (monthlyMap.has(key)) {
        monthlyRegistrations.push(monthlyMap.get(key));
      } else {
        monthlyRegistrations.push({
          month: d.toLocaleString("fr-FR", {
            month: "short",
            year: "numeric",
          }),
          count: 0,
        });
      }
    }

    return res.json({
      totalUsers: Number(usersStats?.totalUsers || 0),
      students: Number(usersStats?.students || 0),
      teachers: Number(usersStats?.teachers || 0),
      classes: Number(classesStats?.classes || 0),
      courses: Number(coursesStats?.courses || 0),
      pendingRequests: Number(requestsStats?.pendingRequests || 0),
      validatedRequests: Number(requestsStats?.validatedRequests || 0),
      paidStudents: Number(paymentStats?.paidStudents || 0),
      unpaidStudents: Number(paymentStats?.unpaidStudents || 0),
      revenue: Number(revenueStats?.revenue || 0),
      monthlyRegistrations,
    });
  } catch (err) {
    console.error("ADMIN STATS ERROR:", err);
    return res.status(500).json({ message: "Erreur stats admin" });
  }
};

export const createUser = async (req, res) => {
  try {
    const {
      full_name,
      first_name,
      last_name,
      email,
      password,
      role,
      username,
    } = req.body;

    const normalizeRole = (value) => {
      const v = String(value || "").trim().toLowerCase();

      const map = {
        student: "student",
        etudiant: "student",
        "étudiant": "student",

        teacher: "teacher",
        enseignant: "teacher",
        formateur: "teacher",

        admin: "admin",
        administrateur: "admin",

        superadmin: "superadmin",
        super_admin: "superadmin",
      };

      return map[v] || null;
    };

    const creatorRole = normalizeRole(req.user?.role);
    const requestedRole = normalizeRole(role);

    if (!["admin", "superadmin"].includes(creatorRole)) {
      return res.status(403).json({
        message: "Accès refusé",
      });
    }

    if (!email || !password || !requestedRole) {
      return res.status(400).json({
        message: "Email, mot de passe et rôle sont requis",
      });
    }

    let safeFirstName = String(first_name || "").trim();
    let safeLastName = String(last_name || "").trim();

    if ((!safeFirstName || !safeLastName) && full_name?.trim()) {
      const parts = String(full_name).trim().split(/\s+/);
      safeFirstName = parts.shift() || "";
      safeLastName = parts.join(" ") || "-";
    }

    if (!safeFirstName || !safeLastName) {
      return res.status(400).json({
        message: "Le prénom et le nom sont requis",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedUsername = username?.trim()
      ? String(username).trim().toLowerCase()
      : null;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Email invalide",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    if (
      normalizedUsername &&
      !/^[a-z0-9._-]{3,20}$/i.test(normalizedUsername)
    ) {
      return res.status(400).json({
        message:
          "Username invalide. Utilise 3 à 20 caractères : lettres, chiffres, point, tiret ou underscore.",
      });
    }

    // Règles métier
    if (creatorRole === "admin") {
      if (!["student", "teacher"].includes(requestedRole)) {
        return res.status(403).json({
          message:
            "Un administrateur peut créer uniquement des étudiants et des formateurs",
        });
      }
    }

    if (creatorRole === "superadmin") {
      if (!["student", "teacher", "admin"].includes(requestedRole)) {
        return res.status(403).json({
          message:
            "Le super administrateur peut créer uniquement student, teacher et admin",
        });
      }
    }

    // Interdiction absolue via cette route
    if (requestedRole === "superadmin") {
      return res.status(403).json({
        message: "La création d'un super administrateur est interdite via cette route",
      });
    }

    const [existingEmail] = await db.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({
        message: "Email déjà utilisé",
      });
    }

    if (normalizedUsername) {
      const [existingUsername] = await db.query(
        "SELECT id FROM users WHERE username = ? LIMIT 1",
        [normalizedUsername]
      );

      if (existingUsername.length > 0) {
        return res.status(409).json({
          message: "Username déjà utilisé",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const columns = ["first_name", "last_name", "email", "password", "role", "status"];
    const values = [safeFirstName, safeLastName, normalizedEmail, hashedPassword, requestedRole, "active"];
    const placeholders = ["?", "?", "?", "?", "?", "?"];

    if (normalizedUsername) {
      columns.splice(3, 0, "username");
      values.splice(3, 0, normalizedUsername);
      placeholders.splice(3, 0, "?");
    }

    const [insertResult] = await db.query(
      `INSERT INTO users (${columns.join(", ")})
      VALUES (${placeholders.join(", ")})`,
      values
    );

    if (requestedRole === "teacher") {
      await db.query(
        `INSERT INTO teachers (user_id, specialization, phone)
        VALUES (?, ?, ?)`,
        [insertResult.insertId, null, null]
      );
    }

    const io = req.app.get("io");
    io?.to("admins").emit("admin:update", {
      type: "user_created",
      role: requestedRole,
      timestamp: Date.now(),
    });

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        first_name: safeFirstName,
        last_name: safeLastName,
        email: normalizedEmail,
        username: normalizedUsername,
        role: requestedRole,
        status: "active",
      },
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    return res.status(500).json({
      message: "Erreur serveur",
    });
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

/* =====================================================
   📝 INSCRIPTION REQUESTS
===================================================== */

export const getInscriptionRequests = async (req, res) => {
  try {
    const { q = "", status = "" } = req.query;

    let sql = `
      SELECT
        ir.id,
        ir.nom,
        ir.prenom,
        ir.email,
        ir.telephone,
        ir.whatsapp,
        ir.sexe,
        ir.date_naissance,
        ir.lieu_naissance,
        ir.quartier,
        ir.arrondissement,
        ir.niveau_langue,
        ir.horaire_prefere,
        ir.module_id,
        ir.session_id,
        ir.status,
        ir.accept_fees,
        ir.user_id,
        ir.created_at,
        ir.updated_at
      FROM inscription_requests ir
      WHERE 1=1
    `;

    const params = [];

    if (q.trim()) {
      sql += `
        AND (
          ir.nom LIKE ?
          OR ir.prenom LIKE ?
          OR ir.email LIKE ?
          OR ir.telephone LIKE ?
          OR ir.whatsapp LIKE ?
        )
      `;
      const like = `%${q.trim()}%`;
      params.push(like, like, like, like, like);
    }

    if (status.trim()) {
      sql += ` AND ir.status = ? `;
      params.push(status.trim());
    }

    sql += ` ORDER BY ir.created_at DESC, ir.id DESC `;

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("GET INSCRIPTION REQUESTS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération demandes d’inscription" });
  }
};

export const updateInscriptionRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ["pending", "validated", "rejected", "enrolled"];
    if (!allowed.includes(String(status || "").trim())) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    const [result] = await db.query(
      `UPDATE inscription_requests
       SET status = ?, updated_at = NOW()
       WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    const [[updated]] = await db.query(
      `SELECT * FROM inscription_requests WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Statut mis à jour",
      request: updated,
    });
  } catch (err) {
    console.error("UPDATE INSCRIPTION REQUEST STATUS ERROR:", err);
    res.status(500).json({ message: "Erreur mise à jour statut" });
  }
};

export const updateInscriptionRequestPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept_fees } = req.body;

    const paidValue = accept_fees ? 1 : 0;

    const [result] = await db.query(
      `UPDATE inscription_requests
       SET accept_fees = ?, updated_at = NOW()
       WHERE id = ?`,
      [paidValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Demande introuvable" });
    }

    const [[updated]] = await db.query(
      `SELECT * FROM inscription_requests WHERE id = ?`,
      [id]
    );

    res.json({
      message: "Paiement mis à jour",
      request: updated,
    });
  } catch (err) {
    console.error("UPDATE INSCRIPTION REQUEST PAYMENT ERROR:", err);
    res.status(500).json({ message: "Erreur mise à jour paiement" });
  }
};

/* =====================================================
   🎓 STUDENTS
===================================================== */

export const getStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.role,
        u.status,
        u.created_at,
        (
          SELECT ir.accept_fees
          FROM inscription_requests ir
          WHERE ir.user_id = u.id OR ir.email = u.email
          ORDER BY ir.id DESC
          LIMIT 1
        ) AS paid,
        (
          SELECT ir.status
          FROM inscription_requests ir
          WHERE ir.user_id = u.id OR ir.email = u.email
          ORDER BY ir.id DESC
          LIMIT 1
        ) AS payment_status
      FROM users u
      WHERE u.role = 'student'
      ORDER BY u.created_at DESC
    `);

    res.json(students);
  } catch (err) {
    console.error("GET STUDENTS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération étudiants" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const [[student]] = await db.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.username,
        u.role,
        u.status,
        u.created_at,
        (
          SELECT ir.accept_fees
          FROM inscription_requests ir
          WHERE ir.user_id = u.id OR ir.email = u.email
          ORDER BY ir.id DESC
          LIMIT 1
        ) AS paid,
        (
          SELECT ir.status
          FROM inscription_requests ir
          WHERE ir.user_id = u.id OR ir.email = u.email
          ORDER BY ir.id DESC
          LIMIT 1
        ) AS payment_status
      FROM users u
      WHERE u.id = ? AND u.role = 'student'
      LIMIT 1
      `,
      [id]
    );

    if (!student) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }

    res.json({
      student: {
        ...student,
        courses: [],
        grades: [],
      },
    });
  } catch (err) {
    console.error("GET STUDENT BY ID ERROR:", err);
    res.status(500).json({ message: "Erreur récupération détail étudiant" });
  }
};

export const updateStudentPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paid } = req.body;

    const [[student]] = await db.query(
      `SELECT id, email FROM users WHERE id = ? AND role = 'student' LIMIT 1`,
      [id]
    );

    if (!student) {
      return res.status(404).json({ message: "Étudiant introuvable" });
    }

    const [[requestRow]] = await db.query(
      `
      SELECT id
      FROM inscription_requests
      WHERE user_id = ? OR email = ?
      ORDER BY id DESC
      LIMIT 1
      `,
      [id, student.email]
    );

    if (!requestRow) {
      return res.status(404).json({
        message: "Aucune demande d’inscription liée à cet étudiant",
      });
    }

    await db.query(
      `UPDATE inscription_requests
       SET accept_fees = ?, updated_at = NOW()
       WHERE id = ?`,
      [paid ? 1 : 0, requestRow.id]
    );

    const [[updated]] = await db.query(
      `
      SELECT
        u.id,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        (
          SELECT ir.accept_fees
          FROM inscription_requests ir
          WHERE ir.user_id = u.id OR ir.email = u.email
          ORDER BY ir.id DESC
          LIMIT 1
        ) AS paid
      FROM users u
      WHERE u.id = ?
      LIMIT 1
      `,
      [id]
    );

    res.json({
      message: "Paiement étudiant mis à jour",
      student: updated,
      paid: Boolean(updated?.paid),
    });
  } catch (err) {
    console.error("UPDATE STUDENT PAYMENT ERROR:", err);
    res.status(500).json({ message: "Erreur mise à jour paiement étudiant" });
  }
};

/* =====================================================
   👨‍🏫 TEACHERS
===================================================== */

export const getTeachers = async (req, res) => {
  try {
    const { q = "", subject = "", class_name = "" } = req.query;

    let sql = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) AS full_name,
        u.email,
        u.username,
        u.role,
        u.status,
        u.created_at,
        t.id AS teacher_profile_id,
        t.specialization,
        t.phone,

        GROUP_CONCAT(DISTINCT cls.name ORDER BY cls.name SEPARATOR '||') AS class_names,
        GROUP_CONCAT(DISTINCT cls.id ORDER BY cls.name SEPARATOR ',') AS class_ids,

        GROUP_CONCAT(DISTINCT cr.title ORDER BY cr.title SEPARATOR '||') AS course_titles,
        GROUP_CONCAT(DISTINCT cr.id ORDER BY cr.title SEPARATOR ',') AS course_ids,

        GROUP_CONCAT(DISTINCT sb.name ORDER BY sb.name SEPARATOR '||') AS subject_names,
        GROUP_CONCAT(DISTINCT sb.id ORDER BY sb.name SEPARATOR ',') AS subject_ids

      FROM users u
      INNER JOIN teachers t ON t.user_id = u.id
      LEFT JOIN teacher_class_assignments tcla ON tcla.teacher_id = t.id
      LEFT JOIN classes cls ON cls.id = tcla.class_id
      LEFT JOIN teacher_course_assignments tcoa ON tcoa.teacher_id = t.id
      LEFT JOIN courses cr ON cr.id = tcoa.course_id
      LEFT JOIN teacher_subject_assignments tsa ON tsa.teacher_id = t.id
      LEFT JOIN subjects sb ON sb.id = tsa.subject_id

      WHERE u.role = 'teacher'
    `;

    const params = [];

    if (q.trim()) {
      sql += `
        AND (
          u.first_name LIKE ?
          OR u.last_name LIKE ?
          OR u.email LIKE ?
          OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
        )
      `;
      const like = `%${q.trim()}%`;
      params.push(like, like, like, like);
    }

    if (subject.trim()) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM teacher_subject_assignments tsa2
          INNER JOIN subjects sb2 ON sb2.id = tsa2.subject_id
          WHERE tsa2.teacher_id = t.id
            AND sb2.name LIKE ?
        )
      `;
      params.push(`%${subject.trim()}%`);
    }

    if (class_name.trim()) {
      sql += `
        AND EXISTS (
          SELECT 1
          FROM teacher_class_assignments tca2
          INNER JOIN classes c2 ON c2.id = tca2.class_id
          WHERE tca2.teacher_id = t.id
            AND c2.name LIKE ?
        )
      `;
      params.push(`%${class_name.trim()}%`);
    }

    sql += `
      GROUP BY
        u.id, u.first_name, u.last_name, u.email, u.username, u.role, u.status, u.created_at,
        t.id, t.specialization, t.phone
      ORDER BY u.created_at DESC
    `;

    const [rows] = await db.query(sql, params);

    const formatted = rows.map((row) => ({
      ...row,
      subject_name: row.subject_names
        ? row.subject_names.split("||")[0]
        : row.specialization || null,
      classes: row.class_names ? row.class_names.split("||") : [],
      class_ids: row.class_ids ? row.class_ids.split(",").map((v) => Number(v)) : [],
      courses: row.course_titles ? row.course_titles.split("||") : [],
      course_ids: row.course_ids ? row.course_ids.split(",").map((v) => Number(v)) : [],
      subjects: row.subject_names ? row.subject_names.split("||") : [],
      subject_ids: row.subject_ids ? row.subject_ids.split(",").map((v) => Number(v)) : [],
    }));

    res.json(formatted);
  } catch (err) {
    console.error("GET TEACHERS ERROR:", err);
    res.status(500).json({ message: "Erreur récupération formateurs" });
  }
};

async function getTeacherPublicRow(userId) {
  const [rows] = await db.query(
    `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      CONCAT(u.first_name, ' ', u.last_name) AS full_name,
      u.email,
      u.username,
      u.role,
      u.status,
      u.created_at,
      t.id AS teacher_profile_id,
      t.specialization AS specialization,
      t.phone,

      GROUP_CONCAT(DISTINCT cls.name ORDER BY cls.name SEPARATOR '||') AS class_names,
      GROUP_CONCAT(DISTINCT cls.id ORDER BY cls.name SEPARATOR ',') AS class_ids,

      GROUP_CONCAT(DISTINCT cr.title ORDER BY cr.title SEPARATOR '||') AS course_titles,
      GROUP_CONCAT(DISTINCT cr.id ORDER BY cr.title SEPARATOR ',') AS course_ids,

      GROUP_CONCAT(DISTINCT sb.name ORDER BY sb.name SEPARATOR '||') AS subject_names,
      GROUP_CONCAT(DISTINCT sb.id ORDER BY sb.name SEPARATOR ',') AS subject_ids

    FROM users u
    INNER JOIN teachers t ON t.user_id = u.id

    LEFT JOIN teacher_class_assignments tcla ON tcla.teacher_id = t.id
    LEFT JOIN classes cls ON cls.id = tcla.class_id

    LEFT JOIN teacher_course_assignments tcoa ON tcoa.teacher_id = t.id
    LEFT JOIN courses cr ON cr.id = tcoa.course_id

    LEFT JOIN teacher_subject_assignments tsa ON tsa.teacher_id = t.id
    LEFT JOIN subjects sb ON sb.id = tsa.subject_id

    WHERE u.id = ?
      AND u.role = 'teacher'

    GROUP BY
      u.id, u.first_name, u.last_name, u.email, u.username, u.role, u.status, u.created_at,
      t.id, t.specialization, t.phone

    LIMIT 1
    `,
    [userId]
  );

  if (!rows.length) return null;

  const row = rows[0];

  return {
    ...row,
    subject_name: row.subject_names
      ? row.subject_names.split("||")[0]
      : row.specialization || null,
    classes: row.class_names ? row.class_names.split("||") : [],
    class_ids: row.class_ids ? row.class_ids.split(",").map((v) => Number(v)) : [],
    courses: row.course_titles ? row.course_titles.split("||") : [],
    course_ids: row.course_ids ? row.course_ids.split(",").map((v) => Number(v)) : [],
    subjects: row.subject_names ? row.subject_names.split("||") : [],
    subject_ids: row.subject_ids ? row.subject_ids.split(",").map((v) => Number(v)) : [],
  };
}



export const assignTeacherToClass = async (req, res) => {
  try {
    const { id } = req.params; // users.id
    const { class_id } = req.body;

    if (!class_id) {
      return res.status(400).json({ message: "class_id requis" });
    }

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [[classRow]] = await db.query(
      `SELECT id, name FROM classes WHERE id = ? LIMIT 1`,
      [class_id]
    );

    if (!classRow) {
      return res.status(404).json({ message: "Classe introuvable" });
    }

    await db.query(
      `
      INSERT INTO teacher_class_assignments (teacher_id, class_id, created_by)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE class_id = VALUES(class_id)
      `,
      [teacherProfile.id, class_id, req.user.id]
    );

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Classe affectée avec succès",
      teacher,
    });
  } catch (err) {
    console.error("ASSIGN TEACHER TO CLASS ERROR:", err);
    res.status(500).json({ message: "Erreur affectation enseignant → classe" });
  }
};

export const removeTeacherClassAssignment = async (req, res) => {
  try {
    const { id, classId } = req.params; // id = users.id

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [result] = await db.query(
      `DELETE FROM teacher_class_assignments
       WHERE teacher_id = ? AND class_id = ?`,
      [teacherProfile.id, classId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Affectation introuvable" });
    }

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Affectation supprimée avec succès",
      teacher,
    });
  } catch (err) {
    console.error("REMOVE TEACHER CLASS ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Erreur suppression affectation" });
  }
};

export const getSubjectsList = async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id, name, code, description, created_at
      FROM subjects
      ORDER BY name ASC
      `
    );

    res.json(rows);
  } catch (err) {
    console.error("GET SUBJECTS LIST ERROR:", err);
    res.status(500).json({ message: "Erreur récupération matières" });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, code, description } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Nom de la matière requis" });
    }

    const [existing] = await db.query(
      `SELECT id FROM subjects WHERE name = ? LIMIT 1`,
      [name.trim()]
    );

    if (existing.length) {
      return res.status(409).json({ message: "Cette matière existe déjà" });
    }

    const [result] = await db.query(
      `
      INSERT INTO subjects (name, code, description)
      VALUES (?, ?, ?)
      `,
      [name.trim(), code?.trim() || null, description?.trim() || null]
    );

    const [[subject]] = await db.query(
      `SELECT id, name, code, description, created_at FROM subjects WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: "Matière créée avec succès",
      subject,
    });
  } catch (err) {
    console.error("CREATE SUBJECT ERROR:", err);
    res.status(500).json({ message: "Erreur création matière" });
  }
};

export const assignTeacherToSubject = async (req, res) => {
  try {
    const { id } = req.params; // users.id
    const { subject_id } = req.body;

    if (!subject_id) {
      return res.status(400).json({ message: "subject_id requis" });
    }

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [[subjectRow]] = await db.query(
      `SELECT id, name FROM subjects WHERE id = ? LIMIT 1`,
      [subject_id]
    );

    if (!subjectRow) {
      return res.status(404).json({ message: "Matière introuvable" });
    }

    await db.query(
      `
      INSERT INTO teacher_subject_assignments (teacher_id, subject_id, created_by)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id)
      `,
      [teacherProfile.id, subject_id, req.user.id]
    );

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Matière affectée avec succès",
      teacher,
    });
  } catch (err) {
    console.error("ASSIGN TEACHER TO SUBJECT ERROR:", err);
    res.status(500).json({ message: "Erreur affectation enseignant → matière" });
  }
};

export const removeTeacherSubjectAssignment = async (req, res) => {
  try {
    const { id, subjectId } = req.params;

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [result] = await db.query(
      `DELETE FROM teacher_subject_assignments
       WHERE teacher_id = ? AND subject_id = ?`,
      [teacherProfile.id, subjectId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Affectation matière introuvable" });
    }

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Affectation matière supprimée avec succès",
      teacher,
    });
  } catch (err) {
    console.error("REMOVE TEACHER SUBJECT ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Erreur suppression affectation matière" });
  }
};

export const getCoursesList = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, title, description, teacher_id, created_at
      FROM courses
      ORDER BY created_at DESC, id DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET COURSES LIST ERROR:", err);
    res.status(500).json({ message: "Erreur récupération cours" });
  }
};

export const assignTeacherToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({ message: "course_id requis" });
    }

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [[courseRow]] = await db.query(
      `SELECT id, title FROM courses WHERE id = ? LIMIT 1`,
      [course_id]
    );

    if (!courseRow) {
      return res.status(404).json({ message: "Cours introuvable" });
    }

    await db.query(
      `INSERT INTO teacher_course_assignments (teacher_id, course_id, created_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE course_id = VALUES(course_id)`,
      [teacherProfile.id, course_id, req.user.id]
    );

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Cours affecté avec succès",
      teacher,
    });
  } catch (err) {
    console.error("ASSIGN TEACHER TO COURSE ERROR:", err);
    res.status(500).json({ message: "Erreur affectation enseignant → cours" });
  }
};

export const removeTeacherCourseAssignment = async (req, res) => {
  try {
    const { id, courseId } = req.params;

    const [[teacherProfile]] = await db.query(
      `SELECT id, user_id FROM teachers WHERE user_id = ? LIMIT 1`,
      [id]
    );

    if (!teacherProfile) {
      return res.status(404).json({ message: "Profil enseignant introuvable" });
    }

    const [result] = await db.query(
      `DELETE FROM teacher_course_assignments
       WHERE teacher_id = ? AND course_id = ?`,
      [teacherProfile.id, courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Affectation cours introuvable" });
    }

    const teacher = await getTeacherPublicRow(id);

    res.json({
      message: "Affectation cours supprimée avec succès",
      teacher,
    });
  } catch (err) {
    console.error("REMOVE TEACHER COURSE ASSIGNMENT ERROR:", err);
    res.status(500).json({ message: "Erreur suppression affectation cours" });
  }
};
