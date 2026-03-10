import jwt from "jsonwebtoken";

/**
 * Middleware d'autorisation par rôle
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Accès refusé - Permissions insuffisantes",
      });
    }

    next();
  };
};