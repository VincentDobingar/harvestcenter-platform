import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';

export function authenticateToken(req, res, next) {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token manquant'
    });
  }

  jwt.verify(token, jwtConfig.secret, jwtConfig, (err, decoded) => {

    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token invalide ou expiré'
      });
    }

    req.user = decoded.data;
    next();
  });
}

/**
 * Vérification de rôle
 */
export function authorizeRoles(...roles) {
  return (req, res, next) => {

    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const allowed = roles.some(r => req.user.roles.includes(r));

    if (!allowed) {
      return res.status(403).json({
        message: 'Rôle non autorisé'
      });
    }

    next();
  };
}

export default function authJwt(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}
