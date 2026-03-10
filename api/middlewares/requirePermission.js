export const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const role = req.user.role;

      const [rows] = await db.query(`
        SELECT 1
        FROM role_permissions rp
        JOIN permissions p ON p.id = rp.permission_id
        WHERE rp.role=? AND p.name=?`,
        [role, permissionName]
      );

      if (!rows.length) {
        return res.status(403).json({ message: "Permission refusée" });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Erreur permission" });
    }
  };
};


export const requireSchoolIsolation = (req, res, next) => {
  if (req.user.school_id !== req.headers["x-school-id"]) {
    return res.status(403).json({ message: "Accès école refusé" });
  }
  next();
};