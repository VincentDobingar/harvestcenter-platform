import db from "../config/db.js";

export const syncOfflineActions = async (req, res) => {
  const { actions } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(actions)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const results = [];

  for (const action of actions) {
    try {
      // 1️⃣ Log action
      await db.query(
        `INSERT INTO offline_actions
         (id, user_id, endpoint, method, payload)
         VALUES (?, ?, ?, ?, ?)`,
        [
          action.id,
          userId,
          action.endpoint,
          action.method,
          JSON.stringify(action.payload)
        ]
      );

      // 2️⃣ Rejouer logique métier
      if (action.endpoint === "/admin/inscriptions/update") {
        const { entityId, status, version } = action.payload;

        const [r] = await db.query(
          `UPDATE inscriptions
           SET status = ?, version = version + 1
           WHERE id = ? AND version = ?`,
          [status, entityId, version]
        );

        if (r.affectedRows === 0) {
          throw new Error("VERSION_CONFLICT");
        }
      }

      // 3️⃣ Marquer comme synchronisé
      await db.query(
        `UPDATE offline_actions
         SET status = 'synced', synced_at = NOW()
         WHERE id = ?`,
        [action.id]
      );

      results.push({ id: action.id, status: "synced" });

    } catch (err) {

      await db.query(
        `INSERT INTO sync_logs
         (offline_action_id, user_id, status, error)
         VALUES (?, ?, 'error', ?)`,
        [action.id, userId, err.message]
      );

      results.push({
        id: action.id,
        status: "failed",
        error: err.message
      });
    }
  }

  // ✅ Pas de WebSocket ici
  res.json({
    synced: results.filter(r => r.status === "synced").length,
    failed: results.filter(r => r.status === "failed").length,
    results
  });
};

export const getSyncHealth = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT sa.id, sa.user_id, u.first_name, u.last_name,
             sa.action_type, sa.endpoint, sa.status,
             sa.synced_at, sl.error
      FROM offline_actions sa
      LEFT JOIN users u ON u.id = sa.user_id
      LEFT JOIN sync_logs sl ON sl.offline_action_id = sa.id
      ORDER BY sa.created_at DESC
    `);

    const data = rows.map(r => ({
      id: r.id,
      user_name: r.first_name && r.last_name
        ? r.first_name + ' ' + r.last_name
        : null,
      action_type: r.action_type,
      endpoint: r.endpoint,
      status: r.status,
      synced_at: r.synced_at,
      error: r.error
    }));

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur récupération sync health" });
  }
};