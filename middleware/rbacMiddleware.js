const pool = require('../db');

const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User information missing from request' });
  }

  // If admin, allow all access
  if (req.user.isAdmin) {
    return next();
  }

  // For non-admin users, check if role is in allowed list
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied: insufficient permissions' });
  }

  next();
};

/**
 * Authorize only admins
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Only admins can access this resource' });
  }
  next();
};

/**
 * Authorize super admin only
 */
const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ error: 'Only super admins can access this resource' });
  }
  next();
};

/**
 * Check if user owns or can access the hotel
 * Super admins can access all hotels
 * Regular users can only access their own hotels
 */
const authorizeHotelAccess = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Super admin can access all hotels
    if (req.user?.isAdmin) {
      return next();
    }

    // Get hotel and check manager_id
    const result = await pool.query(
      `SELECT id, manager_id FROM hotels WHERE id = $1 OR hotel_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotel = result.rows[0];

    // Check if user is the manager of this hotel
    if (hotel.manager_id !== userId) {
      return res.status(403).json({ error: 'Access denied: You can only manage your own hotels' });
    }

    // Store hotel info for controller use
    req.hotel = hotel;
    next();
  } catch (error) {
    console.error('Error in authorizeHotelAccess:', error);
    res.status(500).json({ error: 'Authorization error' });
  }
};

module.exports = { 
  authorizeRoles, 
  authorizeAdmin, 
  authorizeSuperAdmin,
  authorizeHotelAccess 
};
