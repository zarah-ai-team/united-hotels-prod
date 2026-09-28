/**
 * Activity feed for the admin/vendor notification bell.
 *
 * There is no notifications table: the feed is derived on read from the
 * tables that already record each event (bookings, payments, group_requests,
 * users, email_logs). Each source is queried independently and failures are
 * swallowed, so one missing table or column never breaks the bell.
 *
 * Admins see everything. Vendors see only booking activity for hotels
 * assigned to them (hotels.vendor_id).
 */

const pool = require('../db');

const COLUMNS_TTL_MS = 5 * 60 * 1000;
let columnsCache = { expiresAt: 0, byTable: new Map() };

const getColumns = async (table) => {
  const now = Date.now();
  if (columnsCache.expiresAt < now) {
    const result = await pool.query(
      `SELECT table_name, column_name FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name IN ('bookings', 'payments', 'group_requests', 'users', 'email_logs', 'hotels', 'rooms')`
    );
    const byTable = new Map();
    for (const row of result.rows) {
      if (!byTable.has(row.table_name)) byTable.set(row.table_name, new Set());
      byTable.get(row.table_name).add(row.column_name);
    }
    columnsCache = { expiresAt: now + COLUMNS_TTL_MS, byTable };
  }
  return columnsCache.byTable.get(table) || new Set();
};

const pick = (cols, names) => names.find((n) => cols.has(n)) || null;
const q = (name) => `"${String(name).replace(/"/g, '""')}"`;

const money = (amount, currency) => {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${(currency || 'USD').toString().trim().toUpperCase()} ${Math.round(n).toLocaleString('en-US')}`;
};

const shortDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // node-pg returns DATE columns as local midnight, so format in the server's
  // own timezone. Forcing UTC shifted stays a day early on IST machines.
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const joinParts = (parts) => parts.filter(Boolean).join(' · ');

// ── Sources ──────────────────────────────────────────────────────────────────

const bookingEvents = async ({ vendorId, limit }) => {
  const b = await getColumns('bookings');
  if (!b.size) return [];
  const createdCol = pick(b, ['createdAt', 'created_at']);
  if (!createdCol) return [];
  const updatedCol = pick(b, ['updatedAt', 'updated_at']) || createdCol;
  const hotelIdCol = pick(b, ['hotelid', 'hotel_id']);
  const roomIdCol = pick(b, ['roomid', 'room_id']);
  const col = (names) => {
    const c = pick(b, names);
    return c ? `b.${q(c)}` : 'NULL';
  };

  // Hotel via the booking's own hotel id, else via its room.
  const roomJoin = roomIdCol ? `LEFT JOIN rooms r ON r.id::text = b.${q(roomIdCol)}::text` : '';
  const hotelKey = [
    hotelIdCol ? `b.${q(hotelIdCol)}::text` : null,
    roomIdCol ? 'r.hotel_id::text' : null,
  ].filter(Boolean);
  const hotelJoin = hotelKey.length
    ? `LEFT JOIN hotels h ON h.id::text = COALESCE(${hotelKey.join(', ')})`
    : 'LEFT JOIN hotels h ON FALSE';

  const params = [limit];
  const where = vendorId ? `WHERE h.vendor_id = $2` : '';
  if (vendorId) params.push(vendorId);

  const result = await pool.query(
    `SELECT b.id,
            ${col(['status'])} AS status,
            ${col(['guest_name', 'guestname'])} AS guest_name,
            ${col(['room', 'room_name'])} AS room_name,
            ${col(['fromdate', 'check_in_date'])} AS check_in,
            ${col(['todate', 'check_out_date'])} AS check_out,
            ${col(['totalamount', 'total_price'])} AS amount,
            ${col(['currency'])} AS currency,
            b.${q(createdCol)} AS created_at,
            b.${q(updatedCol)} AS updated_at,
            h.id AS hotel_id,
            h.name AS hotel_name
       FROM bookings b
       ${roomJoin}
       ${hotelJoin}
       ${where}
      ORDER BY GREATEST(b.${q(createdCol)}, b.${q(updatedCol)}) DESC NULLS LAST
      LIMIT $1`,
    params
  );

  const events = [];
  for (const row of result.rows) {
    const status = String(row.status || '').toLowerCase();
    const hotel = row.hotel_name || 'a hotel';
    const stay = row.check_in
      ? `${shortDate(row.check_in)}${row.check_out ? `–${shortDate(row.check_out)}` : ''}`
      : null;
    const detail = joinParts([row.guest_name || 'Guest', row.room_name, stay, money(row.amount, row.currency)]);

    events.push({
      id: `booking-${row.id}`,
      type: status === 'pending' ? 'booking_pending' : 'booking',
      title: status === 'pending' ? `Booking awaiting payment · ${hotel}` : `New booking · ${hotel}`,
      detail,
      link: '/admin/bookings',
      createdAt: row.created_at,
    });

    if (status === 'cancelled' && row.updated_at) {
      events.push({
        id: `booking-cancelled-${row.id}`,
        type: 'booking_cancelled',
        title: `Booking BK-${row.id} cancelled · ${hotel}`,
        detail,
        link: '/admin/bookings',
        createdAt: row.updated_at,
      });
    }
  }
  return events;
};

const paymentEvents = async ({ limit }) => {
  const p = await getColumns('payments');
  const createdCol = pick(p, ['created_at', 'createdAt']);
  if (!p.size || !createdCol) return [];
  const bookingCol = pick(p, ['booking_id', 'bookingid']);
  const result = await pool.query(
    `SELECT id,
            ${bookingCol ? q(bookingCol) : 'NULL'} AS booking_id,
            ${p.has('amount') ? 'amount' : 'NULL'} AS amount,
            ${p.has('currency') ? 'currency' : 'NULL'} AS currency,
            ${p.has('status') ? 'status' : 'NULL'} AS status,
            ${q(createdCol)} AS created_at
       FROM payments
      ORDER BY ${q(createdCol)} DESC NULLS LAST
      LIMIT $1`,
    [limit]
  );
  return result.rows.map((row) => {
    const status = String(row.status || '').toLowerCase();
    const failed = ['failed', 'declined', 'error'].includes(status);
    const refunded = ['refunded', 'voided', 'void'].includes(status);
    const ref = row.booking_id ? `BK-${row.booking_id}` : `#${row.id}`;
    return {
      id: `payment-${row.id}`,
      type: failed ? 'payment_failed' : 'payment',
      title: failed ? `Payment failed · ${ref}` : refunded ? `Payment refunded · ${ref}` : `Payment received · ${ref}`,
      detail: joinParts([money(row.amount, row.currency), status || null]),
      link: '/admin/bookings',
      createdAt: row.created_at,
    };
  });
};

const groupRequestEvents = async ({ limit }) => {
  const g = await getColumns('group_requests');
  const createdCol = pick(g, ['created_at', 'createdAt']);
  if (!g.size || !createdCol) return [];
  const result = await pool.query(
    `SELECT id, name,
            ${g.has('destination') ? 'destination' : 'NULL'} AS destination,
            ${g.has('group_size') ? 'group_size' : 'NULL'} AS group_size,
            ${q(createdCol)} AS created_at
       FROM group_requests
      ORDER BY ${q(createdCol)} DESC NULLS LAST
      LIMIT $1`,
    [limit]
  );
  return result.rows.map((row) => ({
    id: `group-${row.id}`,
    type: 'group_request',
    title: `New group inquiry from ${row.name || 'a guest'}`,
    detail: joinParts([row.destination, row.group_size ? `${row.group_size} guests` : null]),
    link: '/admin/group-requests',
    createdAt: row.created_at,
  }));
};

const userEvents = async ({ limit }) => {
  const u = await getColumns('users');
  const createdCol = pick(u, ['createdAt', 'created_at']);
  if (!u.size || !createdCol) return [];
  const result = await pool.query(
    `SELECT id, name, email, ${u.has('role') ? 'role' : `'user'`} AS role, ${q(createdCol)} AS created_at
       FROM users
      ORDER BY ${q(createdCol)} DESC NULLS LAST
      LIMIT $1`,
    [limit]
  );
  return result.rows.map((row) => ({
    id: `user-${row.id}`,
    type: 'user',
    title: row.role && row.role !== 'user' ? `New ${row.role} account` : 'New guest sign-up',
    detail: joinParts([row.name, row.email]),
    link: '/admin/users',
    createdAt: row.created_at,
  }));
};

const emailFailureEvents = async ({ limit }) => {
  const e = await getColumns('email_logs');
  if (!e.size || !e.has('status') || !e.has('created_at')) return [];
  const result = await pool.query(
    `SELECT id, ${e.has('recipient') ? 'recipient' : 'NULL'} AS recipient,
            ${e.has('subject') ? 'subject' : 'NULL'} AS subject, created_at
       FROM email_logs
      WHERE status = 'failed'
      ORDER BY created_at DESC
      LIMIT $1`,
    [limit]
  );
  return result.rows.map((row) => ({
    id: `email-${row.id}`,
    type: 'email_failed',
    title: `Email failed to send${row.recipient ? ` to ${row.recipient}` : ''}`,
    detail: row.subject || null,
    link: '/admin/email-logs',
    createdAt: row.created_at,
  }));
};

// ── Handler ──────────────────────────────────────────────────────────────────

const safe = (label, promise) =>
  promise.catch((err) => {
    console.warn(`[notifications] ${label} source skipped:`, err.message);
    return [];
  });

const getNotifications = async (req, res, next) => {
  try {
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 30));
    const isAdmin = Boolean(req.user?.isAdmin);
    const vendorId = isAdmin ? null : req.user?.id;

    const sources = [safe('bookings', bookingEvents({ vendorId, limit }))];
    if (isAdmin) {
      sources.push(
        safe('payments', paymentEvents({ limit })),
        safe('group_requests', groupRequestEvents({ limit })),
        safe('users', userEvents({ limit })),
        safe('email_logs', emailFailureEvents({ limit })),
      );
    }

    const all = (await Promise.all(sources))
      .flat()
      .filter((n) => n.createdAt && !Number.isNaN(new Date(n.createdAt).getTime()))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)
      .map((n) => ({ ...n, createdAt: new Date(n.createdAt).toISOString() }));

    return res.json({
      notifications: all,
      count: all.length,
      scope: isAdmin ? 'admin' : 'vendor',
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getNotifications };
