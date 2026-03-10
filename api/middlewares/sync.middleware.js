// backend/src/middlewares/sync.middleware.js
export const syncMiddleware = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Accès refusé" });
      }

      next();
    } catch (err) {
      console.error("Erreur middleware sync:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
};
