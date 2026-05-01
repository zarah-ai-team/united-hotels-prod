/**
 * Vendor-only operations: manage rooms in hotels assigned to the vendor and
 * set per-room min/max price bands. The pricing engine reads these bands
 * (see pricingEngine.computeRecommendedPrice via min_price / max_price).
 */

const pool = require('../db');

const isVendorOfHotel = async (vendorId, hotelId) => {
  const result = await pool.query(
    `SELECT vendor_id FROM hotels WHERE id = $1`,
    [hotelId],
  );
  if (result.rowCount === 0) return false;
  return Number(result.rows[0].vendor_id) === Number(vendorId);
};

const getMyHotels = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT h.id, h.name, h.location, h.address, h.image, h."totalRooms",
              COUNT(r.id)::int AS room_count
         FROM hotels h
         LEFT JOIN rooms r ON r.hotel_id = h.id
        WHERE h.vendor_id = $1
        GROUP BY h.id
        ORDER BY h.name ASC`,
      [req.user.id],
    );
    return res.json({ hotels: result.rows, count: result.rowCount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getMyRooms = async (req, res) => {
  try {
    const { hotelId } = req.query;
    const filters = [`h.vendor_id = $1`];
    const params = [req.user.id];

    if (hotelId) {
      filters.push(`r.hotel_id = $${params.length + 1}`);
      params.push(hotelId);
    }

    const result = await pool.query(
      `SELECT r.*, h.name AS hotel_name
         FROM rooms r
         JOIN hotels h ON h.id = r.hotel_id
        WHERE ${filters.join(' AND ')}
        ORDER BY r.hotel_id ASC, r.id ASC`,
      params,
    );

    return res.json({ rooms: result.rows, count: result.rowCount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const updateRoomPriceBand = async (req, res) => {
  try {
    const { id } = req.params;
    const { minPrice, maxPrice } = req.body || {};

    const min = Number(minPrice);
    const max = Number(maxPrice);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return res.status(400).json({ error: 'minPrice and maxPrice must be numbers' });
    }
    if (min < 0 || max < 0) {
      return res.status(400).json({ error: 'Prices must be non-negative' });
    }
    if (max < min) {
      return res.status(400).json({ error: 'maxPrice must be >= minPrice' });
    }

    const room = await pool.query(`SELECT hotel_id FROM rooms WHERE id = $1`, [id]);
    if (room.rowCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (!req.user.isAdmin) {
      const owns = await isVendorOfHotel(req.user.id, room.rows[0].hotel_id);
      if (!owns) {
        return res.status(403).json({ error: 'You can only manage rooms in your own hotels' });
      }
    }

    const result = await pool.query(
      `UPDATE rooms
          SET min_price = $1,
              max_price = $2,
              updated_at = NOW()
        WHERE id = $3
        RETURNING *`,
      [min, max, id],
    );

    return res.json({ message: 'Price band updated', room: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const addRoom = async (req, res) => {
  try {
    const {
      hotelId, name, category, occupancyType = 'double',
      maxGuests = 2, basePrice, minPrice, maxPrice, totalRooms = 1, image = null,
    } = req.body || {};

    if (!hotelId || !name || !basePrice) {
      return res.status(400).json({ error: 'hotelId, name and basePrice are required' });
    }

    if (!req.user.isAdmin) {
      const owns = await isVendorOfHotel(req.user.id, hotelId);
      if (!owns) return res.status(403).json({ error: 'You can only add rooms to your own hotels' });
    }

    const result = await pool.query(
      `INSERT INTO rooms (
        hotel_id, name, category, occupancy_type, max_count,
        total_rooms, available_rooms, price_per_night,
        min_price, max_price, currency_code, room_number, is_available,
        images, created_at, updated_at
      ) VALUES (
        $1::int, $2::text, $3::text, $4::text, $5::int,
        $6::int, $6::int, $7::numeric, $8::numeric, $9::numeric,
        'USD', $2::text, true, $10::jsonb, NOW(), NOW()
      ) RETURNING *`,
      [
        hotelId, name, category || 'standard', occupancyType,
        Number(maxGuests) || 2,
        Number(totalRooms) || 1,
        Number(basePrice),
        Number.isFinite(Number(minPrice)) ? Number(minPrice) : Number(basePrice) * 0.85,
        Number.isFinite(Number(maxPrice)) ? Number(maxPrice) : Number(basePrice) * 1.30,
        JSON.stringify(image ? [image] : []),
      ],
    );

    return res.status(201).json({ message: 'Room created', room: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const filters = req.user.isAdmin ? [] : ['h.vendor_id = $1'];
    const params = req.user.isAdmin ? [] : [req.user.id];
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const result = await pool.query(
      `SELECT b.id,
              b.userid AS user_id, b.roomid AS room_id,
              b.fromdate AS check_in_date, b.todate AS check_out_date,
              b.totalamount AS total_price, b.status,
              NULL::text AS special_request,
              b."createdAt" AS created_at,
              u.name AS user_name, u.email AS user_email,
              r.name AS room_name, r.category AS room_category,
              h.id AS hotel_id, h.name AS hotel_name, h.location AS hotel_location
         FROM bookings b
         LEFT JOIN users u ON u.id::text = b.userid
         LEFT JOIN rooms r ON r.id::text = b.roomid
         LEFT JOIN hotels h ON h.id = r.hotel_id
        ${where}
        ORDER BY b."createdAt" DESC NULLS LAST
        LIMIT 500`,
      params,
    );

    return res.json({ bookings: result.rows, count: result.rowCount });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getVendorStats = async (req, res) => {
  try {
    const isAdmin = !!req.user.isAdmin;
    const scopeFilter = isAdmin ? '' : 'WHERE h.vendor_id = $1';
    const scopeParams = isAdmin ? [] : [req.user.id];

    const [hotelsCount, roomsCount, bookingsCount, revenueRow, perHotel, recentBookings] = await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS count FROM hotels h ${scopeFilter}`,
        scopeParams,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
           FROM rooms r
           JOIN hotels h ON h.id = r.hotel_id
          ${scopeFilter}`,
        scopeParams,
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count
           FROM bookings b
           JOIN rooms r ON r.id::text = b.roomid
           JOIN hotels h ON h.id = r.hotel_id
          ${scopeFilter}`,
        scopeParams,
      ),
      pool.query(
        `SELECT COALESCE(SUM(b.totalamount), 0)::numeric AS total
           FROM bookings b
           JOIN rooms r ON r.id::text = b.roomid
           JOIN hotels h ON h.id = r.hotel_id
          ${scopeFilter}`,
        scopeParams,
      ).catch(() => ({ rows: [{ total: 0 }] })),
      pool.query(
        `SELECT h.id, h.name, h.location,
                COUNT(b.id)::int AS bookings,
                COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
           FROM hotels h
           LEFT JOIN rooms r ON r.hotel_id = h.id
           LEFT JOIN bookings b ON b.roomid = r.id::text
          ${scopeFilter}
          GROUP BY h.id, h.name, h.location
          ORDER BY bookings DESC, h.name ASC
          LIMIT 25`,
        scopeParams,
      ).catch(() => ({ rows: [] })),
      pool.query(
        `SELECT b.id, b.fromdate, b.todate, b.totalamount, b.status,
                u.name AS user_name, u.email AS user_email,
                h.name AS hotel_name
           FROM bookings b
           LEFT JOIN users u ON u.id::text = b.userid
           LEFT JOIN rooms r ON r.id::text = b.roomid
           LEFT JOIN hotels h ON h.id = r.hotel_id
          ${scopeFilter}
          ORDER BY b."createdAt" DESC NULLS LAST
          LIMIT 10`,
        scopeParams,
      ).catch(() => ({ rows: [] })),
    ]);

    return res.json({
      totals: {
        hotels: hotelsCount.rows[0]?.count || 0,
        rooms: roomsCount.rows[0]?.count || 0,
        bookings: bookingsCount.rows[0]?.count || 0,
        revenue: Number(revenueRow.rows[0]?.total) || 0,
        payments: 0,
      },
      usersByRole: { user: 0, vendor: 0, admin: 0 },
      perHotel: perHotel.rows.map((r) => ({
        hotelId: r.id,
        hotelName: r.name,
        location: r.location,
        bookings: Number(r.bookings) || 0,
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
    console.error('getVendorStats error', error);
    return res.status(500).json({ error: error.message });
  }
};

// ─── Vendor analytics ──────────────────────────────────────────────────────
// Same response shape as adminController.getAnalytics so the existing
// AdminAnalyticsPage can render either side without branching, but every
// query is filtered to the staff member's hotels via h.vendor_id.

const getVendorAnalytics = async (req, res) => {
  try {
    const days = Math.max(7, Math.min(365, parseInt(req.query.days, 10) || 30));
    const userId = req.user.id;

    const [bookingTrend, revenueTrend, topHotels, bookingsByStatus, revenueByDistrict, avgBookingValueRow] = await Promise.all([
      // Daily booking + revenue trend over the last N days for the vendor's hotels
      pool.query(
        `WITH days AS (
           SELECT generate_series(
             (CURRENT_DATE - ($1 || ' days')::interval)::date,
             CURRENT_DATE,
             '1 day'::interval
           )::date AS day
         )
         SELECT s.day::text AS date,
                COALESCE(COUNT(b.id), 0)::int AS bookings,
                COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
           FROM days s
           LEFT JOIN bookings b ON b."createdAt"::date = s.day
           LEFT JOIN rooms r ON r.id::text = b.roomid
           LEFT JOIN hotels h ON h.id = r.hotel_id AND h.vendor_id = $2
          GROUP BY s.day
          ORDER BY s.day ASC`,
        [days, userId],
      ).catch(() => ({ rows: [] })),
      // Direct/OTA breakdown — we don't track source, so push everything to direct.
      pool.query(
        `WITH days AS (
           SELECT generate_series(
             (CURRENT_DATE - ($1 || ' days')::interval)::date,
             CURRENT_DATE,
             '1 day'::interval
           )::date AS day
         )
         SELECT s.day::text AS date,
                COALESCE(SUM(b.totalamount), 0)::numeric AS direct,
                0::numeric AS ota
           FROM days s
           LEFT JOIN bookings b ON b."createdAt"::date = s.day
           LEFT JOIN rooms r ON r.id::text = b.roomid
           LEFT JOIN hotels h ON h.id = r.hotel_id AND h.vendor_id = $2
          GROUP BY s.day
          ORDER BY s.day ASC`,
        [days, userId],
      ).catch(() => ({ rows: [] })),
      // Top hotels by revenue (typically just 1 for a single-property vendor)
      pool.query(
        `SELECT h.id, h.name, h.location,
                COUNT(b.id)::int AS bookings,
                COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
           FROM hotels h
           LEFT JOIN rooms r ON r.hotel_id = h.id
           LEFT JOIN bookings b ON b.roomid = r.id::text
          WHERE h.vendor_id = $1
          GROUP BY h.id
          ORDER BY revenue DESC, h.name ASC
          LIMIT 10`,
        [userId],
      ).catch(() => ({ rows: [] })),
      // Bookings grouped by status
      pool.query(
        `SELECT COALESCE(status, 'unknown') AS status, COUNT(*)::int AS count
           FROM bookings b
           JOIN rooms r ON r.id::text = b.roomid
           JOIN hotels h ON h.id = r.hotel_id
          WHERE h.vendor_id = $1
          GROUP BY status
          ORDER BY count DESC`,
        [userId],
      ).catch(() => ({ rows: [] })),
      // Revenue by district (just for completeness — typically a single district)
      pool.query(
        `SELECT COALESCE(h.district, 'Unknown') AS district,
                COUNT(b.id)::int AS bookings,
                COALESCE(SUM(b.totalamount), 0)::numeric AS revenue
           FROM hotels h
           LEFT JOIN rooms r ON r.hotel_id = h.id
           LEFT JOIN bookings b ON b.roomid = r.id::text
          WHERE h.vendor_id = $1
          GROUP BY h.district
          ORDER BY revenue DESC`,
        [userId],
      ).catch(() => ({ rows: [] })),
      // Average booking value
      pool.query(
        `SELECT COALESCE(AVG(b.totalamount), 0)::numeric AS value,
                COUNT(*)::int AS sample_size
           FROM bookings b
           JOIN rooms r ON r.id::text = b.roomid
           JOIN hotels h ON h.id = r.hotel_id
          WHERE h.vendor_id = $1`,
        [userId],
      ).catch(() => ({ rows: [{ value: 0, sample_size: 0 }] })),
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
      // Vendor doesn't see system-wide users — return zeros so the chart hides gracefully.
      usersByRole: { user: 0, vendor: 0, admin: 0 },
      revenueByDistrict: revenueByDistrict.rows.map((r) => ({
        district: r.district,
        bookings: Number(r.bookings) || 0,
        revenue: Number(r.revenue) || 0,
      })),
      avgBookingValue: {
        value: Number(avgBookingValueRow.rows[0]?.value) || 0,
        sampleSize: Number(avgBookingValueRow.rows[0]?.sample_size) || 0,
      },
    });
  } catch (error) {
    console.error('getVendorAnalytics error', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getMyHotels, getMyRooms, updateRoomPriceBand, addRoom, getMyBookings, getVendorStats, getVendorAnalytics };
