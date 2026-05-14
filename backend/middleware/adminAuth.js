/**
 * Admin Authorization Middleware
 * Must be used AFTER the auth middleware (req.user must already be set)
 */
const adminAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required. You do not have permission to perform this action.' });
  }
  next();
};

module.exports = adminAuth;
