const jwt = require('jsonwebtoken');
const pool = require('../db');

const normalizeUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role || null,
  isAdmin: Boolean(row.isAdmin ?? row.isadmin ?? row.is_admin ?? false),
  isManager: Boolean(row.isManager ?? row.ismanager ?? row.is_manager ?? false)
});

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
    const payload = jwt.verify(token, secret);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0] ? normalizeUser(userResult.rows[0]) : null;

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
    const payload = jwt.verify(token, secret);
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0] ? normalizeUser(userResult.rows[0]) : null;

    if (!user) {
      req.user = null;
      return next();
    }

    req.user = user;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = { authenticate, authenticateOptional };
