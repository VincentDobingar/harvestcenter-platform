// api/middlewares/requireRole.js

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Non authentifié" });
    }

    const currentRole = String(req.user.role || "").trim().toLowerCase();
    const allowedRoles = roles.map((r) => String(r || "").trim().toLowerCase());

    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        message: "Accès refusé - Permissions insuffisantes",
      });
    }

    next();
  };
};