import jwt from "jsonwebtoken";

export const requireAuth = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.cookies?.access_token;

      if (!token) {
        return res.status(401).json({
          message: "Non authentifié"
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Si aucun rôle n'est précisé → juste authentification
      if (allowedRoles.length === 0) {
        return next();
      }

      // Superadmin a tous les droits
      if (decoded.role === "superadmin") {
        return next();
      }

      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          message: "Accès refusé"
        });
      }

      next();
    } catch (error) {
      console.error("Erreur requireAuth:", error);
      return res.status(403).json({
        message: "Token invalide"
      });
    }
  };
};