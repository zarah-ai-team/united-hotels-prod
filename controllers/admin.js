/**
 * Admin-only operations: dashboard stats, user management, vendor assignment.
 *
 * Routes mounted at /api/admin/* (see routes/adminRoute.js).
 */

const pool = require('../db');
const bcrypt = require('bcrypt');

const ALLOWED_ROLES = ['user', 'vendor', 'admin'];

const mapUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phoneNumber: row.phonenumber || row.phoneNumber || null,
  role: row.role || (row.isAdmin ? 'admin' : 'user'),
  isAdmin: Boolean(row.isAdmin || row.role === 'admin'),
  isManager: Boolean(row.isManager || row.role === 'vendor'),
  createdAt: row.createdAt || row.created_at || null,
  updatedAt: row.updatedAt || row.updated_at || null,
});

let bookingsCountryColumnEnsured = false;
const ensureBookingsCountryColumn = async () => {
  if (bookingsCountryColumnEnsured) return;
  await pool.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS country text`).catch(() => {});
  bookingsCountryColumnEnsured = true;
};

// ─── Stats ───────────────────────────────────────────────────────────────

const getDashboardStats = async (_req, res) => {
  try {
    const [
      hotelsCount,
      roomsCount,
      bookingsCount,
      usersByRole,
      revenue,
      perHotel,
      recentBookings,
    ] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM hotels WHERE COALESCE(status, 'active') = 'active'`),
      pool.query(`SELECT COUNT(*)::int AS count FROM rooms`),
      pool.query(`SELECT COUNT(*)::int AS count FROM bookings`),
      pool.query(`
        SELECT role, COUNT(*)::int AS count FROM users
        WHERE role IS NOT NULL GROUP BY role
      `),
      pool.query(`
        SELECT COALESCE(SUM(amount), 0)::numeric AS total, COUNT(*)::int AS count
        FROM payments WHERE status IN ('created', 'succeeded', 'paid')
      `).catch(() => ({ rows: [{ total: 0, count: 0 }] })),
      pool.query(`
        SELECT
          h.id, h.name, h.location,
          COUNT(b.id)::int AS bookings_count,
          COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
        FROM hotels h
        LEFT JOIN rooms r ON r.hotel_id = h.id
        LEFT JOIN bookings b ON b.roomid = r.id::text
        GROUP BY h.id, h.name, h.location
        ORDER BY bookings_count DESC, h.name ASC
        LIMIT 25
      `).catch(() => ({ rows: [] })),
      pool.query(`
        SELECT b.id, b.fromdate, b.todate, b.totalamount, b.status,
               u.name AS user_name, u.email AS user_email,
               h.name AS hotel_name
        FROM bookings b
        LEFT JOIN users u ON u.id::text = b.userid
        LEFT JOIN rooms r ON r.id::text = b.roomid
        LEFT JOIN hotels h ON h.id = r.hotel_id
        ORDER BY b."createdAt" DESC NULLS LAST
        LIMIT 10
      `).catch(() => ({ rows: [] })),
    ]);

    const usersByRoleMap = usersByRole.rows.reduce((acc, r) => {
      acc[r.role] = r.count;
      return acc;
    }, { user: 0, vendor: 0, admin: 0 });

    return res.json({
      totals: {
        hotels: hotelsCount.rows[0].count,
        rooms: roomsCount.rows[0].count,
        bookings: bookingsCount.rows[0].count,
        revenue: Number(revenue.rows[0].total) || 0,
        payments: revenue.rows[0].count,
      },
      usersByRole: usersByRoleMap,
      perHotel: perHotel.rows.map((r) => ({
        hotelId: r.id,
        hotelName: r.name,
        location: r.location,
        bookings: r.bookings_count,
        revenue: Number(r.revenue) || 0,
      })),
      recentBookings: recentBookings.rows.map((b) => ({
        id: b.id,
        checkIn: b.fromdate,
        checkOut: b.todate,
        totalPrice: Number(b.totalamount) || 0,
        status: b.status,
        userName: b.user_name,
        userEmail: b.user_email,
        hotelName: b.hotel_name,
      })),
    });
  } catch (error) {
    console.error('getDashboardStats error', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── Analytics (richer breakdowns for charts) ─────────────────────────────

const getAnalytics = async (req, res) => {
  try {
    const days = Math.max(7, Math.min(365, parseInt(req.query.days, 10) || 30));

    const [
      bookingTrend,
      revenueTrend,
      topHotels,
      bookingsByStatus,
      usersByRole,
      revenueByDistrict,
      avgBookingValue,
    ] = await Promise.all([
      // Daily bookings count for the trailing N days.
      pool.query(`
        WITH series AS (
          SELECT generate_series(
            (CURRENT_DATE - INTERVAL '${days - 1} days')::date,
            CURRENT_DATE::date,
            '1 day'::interval
          )::date AS day
        )
        SELECT s.day::text AS date,
               COUNT(b.id)::int AS bookings,
               COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
          FROM series s
          LEFT JOIN bookings b ON b."createdAt"::date = s.day
         GROUP BY s.day
         ORDER BY s.day
      `).catch(() => ({ rows: [] })),

      // Direct vs OTA split per day. We don't currently track source, so we
      // model 'direct' as user-bookings (user_id IS NOT NULL) and 'ota' as
      // anonymous bookings (user_id IS NULL). When a real source column lands,
      // swap this query.
      pool.query(`
        WITH series AS (
          SELECT generate_series(
            (CURRENT_DATE - INTERVAL '${days - 1} days')::date,
            CURRENT_DATE::date,
            '1 day'::interval
          )::date AS day
        )
        SELECT s.day::text AS date,
               COALESCE(SUM(CASE WHEN b.userid IS NOT NULL THEN b.totalamount ELSE 0 END), 0)::numeric AS direct,
               COALESCE(SUM(CASE WHEN b.userid IS NULL THEN b.totalamount ELSE 0 END), 0)::numeric AS ota
          FROM series s
          LEFT JOIN bookings b ON b."createdAt"::date = s.day
         GROUP BY s.day
         ORDER BY s.day
      `).catch(() => ({ rows: [] })),

      // Top 10 hotels by bookings + revenue.
      pool.query(`
        SELECT h.id, h.name, h.location,
               COUNT(b.id)::int AS bookings,
               COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
          FROM hotels h
          LEFT JOIN rooms r ON r.hotel_id = h.id
          LEFT JOIN bookings b ON b.roomid = r.id::text
         GROUP BY h.id, h.name, h.location
         ORDER BY bookings DESC, revenue DESC
         LIMIT 10
      `).catch(() => ({ rows: [] })),

      // Status breakdown for the bookings pie chart.
      pool.query(`
        SELECT COALESCE(status, 'unknown') AS status, COUNT(*)::int AS count
          FROM bookings
         GROUP BY status
         ORDER BY count DESC
      `).catch(() => ({ rows: [] })),

      pool.query(`
        SELECT role, COUNT(*)::int AS count FROM users
         WHERE role IS NOT NULL
         GROUP BY role
      `).catch(() => ({ rows: [] })),

      pool.query(`
        SELECT COALESCE(h.district, h.location, 'Unknown') AS district,
               COUNT(b.id)::int AS bookings,
               COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
          FROM hotels h
          LEFT JOIN rooms r ON r.hotel_id = h.id
          LEFT JOIN bookings b ON b.roomid = r.id::text
         GROUP BY 1
         ORDER BY revenue DESC
         LIMIT 10
      `).catch(() => ({ rows: [] })),

      pool.query(`
        SELECT COALESCE(AVG(totalamount), 0)::numeric AS avg_value,
               COUNT(*)::int AS sample_size
          FROM bookings
         WHERE "createdAt" >= NOW() - ($1 || ' days')::interval
      `, [String(days)]).catch(() => ({ rows: [{ avg_value: 0, sample_size: 0 }] })),
    ]);

    return res.json({
      window: { days, generatedAt: new Date().toISOString() },
      bookingTrend: bookingTrend.rows.map((r) => ({
        date: r.date,
        bookings: Number(r.bookings) || 0,
        revenue: Number(r.revenue) || 0,
      })),
      revenueTrend: revenueTrend.rows.map((r) => ({
        date: r.date,
        direct: Number(r.direct) || 0,
        ota: Number(r.ota) || 0,
      })),
      topHotels: topHotels.rows.map((r) => ({
        hotelId: r.id,
        hotelName: r.name,
        location: r.location,
        bookings: Number(r.bookings) || 0,
        revenue: Number(r.revenue) || 0,
      })),
      bookingsByStatus: bookingsByStatus.rows.map((r) => ({
        status: r.status,
        count: Number(r.count) || 0,
      })),
      usersByRole: usersByRole.rows.reduce(
        (acc, r) => ({ ...acc, [r.role]: Number(r.count) || 0 }),
        { user: 0, vendor: 0, admin: 0 },
      ),
      revenueByDistrict: revenueByDistrict.rows.map((r) => ({
        district: r.district,
        bookings: Number(r.bookings) || 0,
        revenue: Number(r.revenue) || 0,
      })),
      avgBookingValue: {
        value: Number(avgBookingValue.rows[0]?.avg_value) || 0,
        sampleSize: Number(avgBookingValue.rows[0]?.sample_size) || 0,
      },
    });
  } catch (error) {
    console.error('getAnalytics error', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── Bookings by country (admin world map) ───────────────────────────────

const getBookingsByCountry = async (_req, res) => {
  try {
    await ensureBookingsCountryColumn();
    // Make sure users.country exists too so the COALESCE join below doesn't trip.
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country text`).catch(() => {});

    const result = await pool.query(`
      SELECT COALESCE(
               NULLIF(TRIM(b.country), ''),
               NULLIF(TRIM(u.country), ''),
               'Unknown'
             ) AS country,
             COUNT(*)::int AS bookings,
             COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
        FROM bookings b
        LEFT JOIN users u ON u.id::text = b.userid
       GROUP BY 1
       ORDER BY bookings DESC, country ASC
       LIMIT 50
    `);

    const totalBookings = result.rows.reduce((sum, r) => sum + Number(r.bookings || 0), 0);

    return res.json({
      total: totalBookings,
      countries: result.rows.map((r) => ({
        country: r.country,
        bookings: Number(r.bookings) || 0,
        revenue: Number(r.revenue) || 0,
        share: totalBookings > 0 ? Number(((Number(r.bookings) / totalBookings) * 100).toFixed(2)) : 0,
      })),
    });
  } catch (error) {
    console.error('getBookingsByCountry error', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── User management ─────────────────────────────────────────────────────

const listUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filters = [];
    const params = [];

    if (role && ALLOWED_ROLES.includes(role)) {
      filters.push(`role = $${params.length + 1}`);
      params.push(role);
    }
    if (search) {
      filters.push(`(LOWER(name) LIKE $${params.length + 1} OR LOWER(email) LIKE $${params.length + 1})`);
      params.push(`%${String(search).toLowerCase()}%`);
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const result = await pool.query(
      `SELECT * FROM users ${where} ORDER BY id DESC LIMIT 200`,
      params,
    );

    return res.json({ users: result.rows.map(mapUser), count: result.rowCount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const adminRegisterUser = async (req, res) => {
  try {
    const { name, email, password, phoneNumber, role = 'user' } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rowCount > 0) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const phone = phoneNumber ? String(phoneNumber).replace(/\D/g, '') || null : null;
    const isAdmin = role === 'admin';
    const isManager = role === 'vendor';

    const inserted = await pool.query(
      `INSERT INTO users (name, email, password, phonenumber, role, "isAdmin", "isManager", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [name, email, hashed, phone, role, isAdmin, isManager],
    );

    return res.status(201).json({
      message: 'User created successfully',
      user: mapUser(inserted.rows[0]),
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ALLOWED_ROLES.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE users
       SET role = $1, "isAdmin" = $2, "isManager" = $3, "updatedAt" = NOW()
       WHERE id = $4
       RETURNING *`,
      [role, role === 'admin', role === 'vendor', id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ message: 'Role updated', user: mapUser(result.rows[0]) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    return res.json({ message: 'User deleted' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ─── Vendor assignment ────────────────────────────────────────────────────

const assignVendorToHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const { vendorId } = req.body || {};

    if (vendorId !== null && vendorId !== undefined) {
      const userCheck = await pool.query(
        `SELECT id, role FROM users WHERE id = $1`,
        [vendorId],
      );
      if (userCheck.rowCount === 0) {
        return res.status(404).json({ error: 'Vendor user not found' });
      }
      if (userCheck.rows[0].role !== 'vendor') {
        return res.status(400).json({ error: 'Target user is not a vendor' });
      }
    }

    const result = await pool.query(
      `UPDATE hotels SET vendor_id = $1, "updatedAt" = NOW() WHERE id = $2 RETURNING *`,
      [vendorId || null, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    return res.json({ message: 'Vendor assigned', hotel: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// ─── Room pricing (admin can fluctuate any room) ─────────────────────────

const updateRoomPrice = async (req, res) => {
  try {
    const { id } = req.params;
    const { basePrice, minPrice, maxPrice } = req.body || {};

    const updates = [];
    const values = [];

    if (basePrice !== undefined) {
      const v = Number(basePrice);
      if (!Number.isFinite(v) || v < 0) return res.status(400).json({ error: 'basePrice must be a non-negative number' });
      values.push(v);
      updates.push(`price_per_night = $${values.length}`);
    }
    if (minPrice !== undefined) {
      const v = Number(minPrice);
      if (!Number.isFinite(v) || v < 0) return res.status(400).json({ error: 'minPrice must be a non-negative number' });
      values.push(v);
      updates.push(`min_price = $${values.length}`);
    }
    if (maxPrice !== undefined) {
      const v = Number(maxPrice);
      if (!Number.isFinite(v) || v < 0) return res.status(400).json({ error: 'maxPrice must be a non-negative number' });
      values.push(v);
      updates.push(`max_price = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Provide at least one of basePrice, minPrice, maxPrice' });
    }

    if (basePrice !== undefined && minPrice !== undefined && Number(minPrice) > Number(basePrice)) {
      return res.status(400).json({ error: 'minPrice cannot exceed basePrice' });
    }
    if (basePrice !== undefined && maxPrice !== undefined && Number(maxPrice) < Number(basePrice)) {
      return res.status(400).json({ error: 'maxPrice cannot be lower than basePrice' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE rooms
          SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${values.length}
        RETURNING *`,
      values,
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Room not found' });
    return res.json({ message: 'Room price updated', room: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getBookingsByCountry,
  listUsers,
  adminRegisterUser,
  updateUserRole,
  deleteUser,
  assignVendorToHotel,
  updateRoomPrice,
};
