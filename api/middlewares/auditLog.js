export const auditLog = (action, entity) => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      if (res.statusCode < 400) {
        await db.query(
          `INSERT INTO audit_logs
           (user_id, action, entity, entity_id, ip_address)
           VALUES (?, ?, ?, ?, ?)`,
          [
            req.user?.id || null,
            action,
            entity,
            req.params.id || null,
            req.ip
          ]
        );
      }
    });
    next();
  };
};
