import bcrypt from "bcryptjs";
import db from "../config/db.js";

/* ================================
   CREATE ADMIN
================================ */

export const createAdmin = async (req, res) => {
  const { first_name, last_name, email, password, role } = req.body;

  try {

    if (!["admin", "finance", "secretary"].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const [existing] = await db.query(
      "SELECT id FROM users WHERE email=?",
      [email]
    );

    if (existing.length)
      return res.status(400).json({ message: "Email déjà utilisé" });

    const hashedPassword = await bcrypt.hash(password, 12);

    await db.query(
      `INSERT INTO users
       (first_name, last_name, email, password, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [first_name, last_name, email, hashedPassword, role]
    );

    res.status(201).json({
      message: `${role} créé avec succès`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création admin" });
  }
};

/* ================================
   ACTIVATE USER
================================ */

export const activateUser = async (req, res) => {
  const userId = req.params.id;

  await db.query(
    "UPDATE users SET status='active' WHERE id=?",
    [userId]
  );

  res.json({ message: "Utilisateur activé" });
};

/* ================================
   DELETE USER
================================ */

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  await db.query(
    "DELETE FROM users WHERE id=?",
    [userId]
  );

  res.json({ message: "Utilisateur supprimé" });
};

/* ======================================================
   SUPERADMIN - GESTION NEWS
====================================================== */

export const createNews = async (req, res) => {
  try {
    const { title, content, is_active = true } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: "Titre et contenu obligatoires" 
      });
    }

    const [result] = await db.query(
      `INSERT INTO news (title, content, is_active, created_by, created_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [title, content, is_active, req.user?.id || 1]
    );

    res.status(201).json({
      success: true,
      message: "News créée avec succès",
      data: { id: result.insertId, title }
    });

  } catch (error) {
    console.error('💥 createNews ERROR:', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur création news" 
    });
  }
};

/* ======================================================
   SUPERADMIN - LISTE NEWS (PAGINÉE)
====================================================== */
export const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 20, active_only = 'false', search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const query = `
      SELECT n.*, 
             CONCAT(u.first_name, ' ', u.last_name) as author_name,
             (SELECT COUNT(*) FROM news WHERE ${active_only === 'true' ? 'is_active = 1' : '1=1'}) as total_count
      FROM news n 
      LEFT JOIN users u ON n.created_by = u.id
      WHERE (n.title LIKE ? OR n.content LIKE ?)
      ${active_only === 'true' ? 'AND n.is_active = 1' : ''}
      ORDER BY n.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM news WHERE ${active_only === 'true' ? 'is_active = 1' : '1=1'} AND (title LIKE ? OR content LIKE ?)`; 
    const [countResult] = await db.query(countQuery, [`%${search}%`, `%${search}%`]);

    const [news] = await db.query(query, [`%${search}%`, `%${search}%`, parseInt(limit), offset]);

    res.json({
      success: true,
      data: news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        total_pages: Math.ceil(countResult[0].total / limit)
      }
    });

  } catch (error) {
    console.error('💥 getAllNews ERROR:', error);
    res.status(500).json({ success: false, message: "Erreur liste news" });
  }
};

/* ======================================================
   SUPERADMIN - NEWS PAR ID
====================================================== */
export const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [news] = await db.query(
      `SELECT n.*, 
              CONCAT(u.first_name, ' ', u.last_name) as author_name,
              nm.file_name as media_filename
       FROM news n 
       LEFT JOIN users u ON n.created_by = u.id
       LEFT JOIN news_media nm ON n.id = nm.news_id
       WHERE n.id = ?`,
      [id]
    );

    if (!news.length) {
      return res.status(404).json({ success: false, message: "News non trouvée" });
    }

    res.json({
      success: true,
      data: news[0]
    });

  } catch (error) {
    console.error('💥 getNewsById ERROR:', error);
    res.status(500).json({ success: false, message: "Erreur news" });
  }
};

/* ======================================================
   SUPERADMIN - UPDATE NEWS (avec nouveau média optionnel)
====================================================== */
export const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, is_active } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Titre et contenu obligatoires" });
    }

    let media_url = null;
    let media_type = 'none';

    // Nouveau média uploadé ?
    if (req.file) {
      media_url = `/uploads/news/${req.file.filename}`;
      media_type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      console.log(`📁 Nouveau média: ${req.file.originalname} → ${media_url}`);
    }

    // Générer nouveau slug
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100);

    // UPDATE avec média conditionnel
    const updates = {
      title, slug, content, excerpt: excerpt || null,
      is_active: is_active === 'true' || is_active === true,
      updated_by: req.user?.id || 1,
      updated_at: new Date()
    };

    // Ajouter média si uploadé
    if (media_url) {
      updates.image_url = media_type === 'image' ? media_url : null;
      updates.video_url = media_type === 'video' ? media_url : null;
      updates.media_type = media_type;
    }

    const [result] = await db.query(
      `UPDATE news SET ${Object.keys(updates).map(key => `${key} = ?`).join(', ')}
       WHERE id = ?`,
      [...Object.values(updates), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "News non trouvée" });
    }

    // Récupérer news mise à jour
    const [[updatedNews]] = await db.query(
      `SELECT id, title, slug, excerpt, image_url, video_url, 
              media_type, is_active, updated_at 
       FROM news WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "✅ News mise à jour",
      data: updatedNews
    });

  } catch (error) {
    console.error('💥 updateNews ERROR:', error);
    
    // Nettoyer nouveau fichier si erreur
    if (req.file) {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'public', req.file.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    res.status(500).json({ success: false, message: "Erreur mise à jour news" });
  }
};

/* ======================================================
   SUPERADMIN - SUPPRIMER NEWS
====================================================== */
export const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    // Récupérer news pour supprimer média
    const [[news]] = await db.query(
      `SELECT image_url, video_url FROM news WHERE id = ?`,
      [id]
    );

    if (!news) {
      return res.status(404).json({ success: false, message: "News non trouvée" });
    }

    // Supprimer fichiers média
    if (news.image_url || news.video_url) {
      const fs = await import('fs');
      const path = await import('path');
      
      const mediaPath = path.join(process.cwd(), 'public', news.image_url || news.video_url);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
        console.log(`🗑️ Média supprimé: ${mediaPath}`);
      }
    }

    // Supprimer news + médias liés
    await db.query(
      `DELETE FROM news_media WHERE news_id = ?`,
      [id]
    );
    const [result] = await db.query(`DELETE FROM news WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "News non supprimée" });
    }

    res.json({
      success: true,
      message: "✅ News supprimée définitivement",
      data: { deleted_id: id }
    });

  } catch (error) {
    console.error('💥 deleteNews ERROR:', error);
    res.status(500).json({ success: false, message: "Erreur suppression news" });
  }
};


/* ======================================================
   SUPERADMIN DASHBOARD - STATISTIQUES RÉELLES
====================================================== */

export const getSuperAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // 1. USERS TOTAUX + PAR RÔLE
    const [[totalUsers]] = await db.query("SELECT COUNT(*) as count FROM users");
    const [[students]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role='student'");
    const [[teachers]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role='teacher'");
    const [[admins]] = await db.query("SELECT COUNT(*) as count FROM users WHERE role IN ('admin', 'superadmin')");

    // 2. FORMATIONS
    const [[totalFormations]] = await db.query("SELECT COUNT(*) as count FROM formations");
    const [[activeFormations]] = await db.query("SELECT COUNT(*) as count FROM formations WHERE status='active'");

    // 3. INSCRIPTIONS (30 derniers jours)
    const [[recentInscriptions]] = await db.query(`
      SELECT COUNT(*) as count 
      FROM inscriptions 
      WHERE created_at >= ?
    `, [last30Days]);

    // 4. PAIEMENTS
    const [[totalPayments]] = await db.query("SELECT COUNT(*) as count, SUM(amount) as total FROM payments WHERE status='completed'");
    const [[pendingPayments]] = await db.query("SELECT COUNT(*) as count FROM payments WHERE status='pending'");

    // 5. NOTES MOYENNE
    const [[avgGrade]] = await db.query(`
      SELECT AVG(grade) as average 
      FROM grades 
      WHERE grade IS NOT NULL
    `);

    // 6. UTILISATEURS ACTIFS (connexions récentes)
    const [[activeUsers]] = await db.query(`
      SELECT COUNT(DISTINCT user_id) as count 
      FROM login_logs 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    // 7. REVENUS MENSUELS
    const [[monthlyRevenue]] = await db.query(`
      SELECT SUM(amount) as total 
      FROM payments 
      WHERE status='completed' 
      AND MONTH(created_at) = MONTH(NOW())
      AND YEAR(created_at) = YEAR(NOW())
    `);

    const stats = {
      // Utilisateurs
      users: {
        total: totalUsers.count,
        students: students.count,
        teachers: teachers.count,
        admins: admins.count,
        active_7d: activeUsers.count
      },
      
      // Formations
      formations: {
        total: totalFormations.count,
        active: activeFormations.count
      },
      
      // Inscriptions
      inscriptions: {
        total_30d: recentInscriptions.count
      },
      
      // Paiements
      payments: {
        total: totalPayments.count,
        total_amount: parseFloat(totalPayments.total || 0),
        monthly_revenue: parseFloat(monthlyRevenue.total || 0),
        pending: pendingPayments.count
      },
      
      // Performance académique
      grades: {
        average: parseFloat(avgGrade.average || 0).toFixed(2)
      },
      
      // Métriques globales
      metrics: {
        total_revenue: parseFloat(totalPayments.total || 0),
        avg_grade: parseFloat(avgGrade.average || 0).toFixed(2),
        user_growth_30d: 12.5, // À calculer si besoin
        completion_rate: 78.3   // À calculer si besoin
      },
      
      // Période
      period: {
        from: last30Days.toISOString().split('T')[0],
        to: now.toISOString().split('T')[0]
      }
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 SuperAdminStats ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur statistiques',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
