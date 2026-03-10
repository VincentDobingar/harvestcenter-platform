// Stub pour requireAuth
export const requireAuth = (roles = []) => (req, res, next) => {
  req.user = { id: 1, role: roles[0] || "student" };
  next();
};

// Stub pour rôle
export const role = (...roles) => (req, res, next) => next();

// Stub pour permissions
export const requirePermission = (perm) => (req, res, next) => next();

// Stub pour audit log
export const auditLog = (action, entity) => (req, res, next) => next();

// Stub pour offline sync guard
export const offlineSyncGuard = (req, res, next) => next();

// Stub multer upload
export const uploadNewsMedia = (req, res, next) => next();
export const uploadNewsImages = (req, res, next) => next();

// Stub pour requireActiveStudent
export const requireActiveStudent = (req, res, next) => next();