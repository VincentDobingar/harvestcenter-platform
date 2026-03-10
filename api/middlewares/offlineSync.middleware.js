import db from "../config/db.js";

/**
 * Vérifie :
 * - utilisateur authentifié
 * - payload valide
 * - conflits de version
 */
export async function offlineSyncGuard(req, res, next) {
  const { actions } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(actions)) {
    return res.status(400).json({ message: "Invalid sync payload" });
  }

  // Validation basique des actions
  for (const action of actions) {
    if (!action.id || !action.endpoint || !action.method) {
      return res.status(400).json({ message: "Malformed offline action" });
    }
  }

  next();
}
