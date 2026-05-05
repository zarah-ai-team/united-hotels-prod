/**
 * Dynamic RBAC end-to-end test — admin → user → vendor.
 *
 * Hits the live backend on http://localhost:5000 and the live Neon Postgres
 * database. Creates real records and leaves them in place so the user can
 * inspect them afterwards (test hotel name is prefixed with "TEST RBAC" so
 * they are easy to spot/delete later).
 *
 * Usage:  node scripts/rbacTest.js
 *
 * Expects the backend to already be running and reachable.
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../db.postgres');

const BASE = process.env.RBAC_BASE_URL || 'http://localhost:5000';

// ── Test result accumulator ─────────────────────────────────────────────────
const results = [];
const recordIds = {};        // hotelId, roomId, vendorBookingId, userBookingId, guestUserId
const tokens = {};           // adminToken, vendorToken, guestToken

function record({ id, action, method, path, expected, actual, ms, evidence, pass, extra }) {
  results.push({ id, action, method, path, expected, actual, ms, evidence, pass, extra });
  const tag = pass ? '✅' : '❌';
  console.log(`${tag} ${id}  ${method.padEnd(6)} ${path.padEnd(45)} expected=${expected} actual=${actual} (${ms}ms)  ${evidence || ''}`);
  if (!pass && extra) console.log(`   └── ${typeof extra === 'string' ? extra : JSON.stringify(extra).slice(0, 300)}`);
}

async function call({ method, path, headers = {}, body }) {
  const start = Date.now();
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(`${BASE}${path}`, opts);
  let json = null; let text = '';
  try { text = await r.text(); json = text ? JSON.parse(text) : null; } catch (_) { json = text; }
  return { status: r.status, ok: r.ok, body: json, ms: Date.now() - start };
}

// ── Phase 0 ─────────────────────────────────────────────────────────────────
async function phase0Setup() {
  // 0.1 health check
  {
    const r = await call({ method: 'GET', path: '/api/health' });
    record({ id: 'P0.1', action: 'Backend health', method: 'GET', path: '/api/health',
      expected: 200, actual: r.status, ms: r.ms, evidence: JSON.stringify(r.body),
      pass: r.status === 200 && r.body?.status === 'ok' });
  }

  // 0.2 reset vendor password
  {
    const start = Date.now();
    try {
      const hash = bcrypt.hashSync('vendor123', 10);
      const u = await pool.query(`UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role, "isAdmin", "isManager"`, [hash, 'bro@example.com']);
      record({ id: 'P0.2', action: 'Reset vendor password', method: 'SQL', path: 'UPDATE users (bro@example.com)',
        expected: 1, actual: u.rowCount, ms: Date.now() - start,
        evidence: u.rowCount ? `vendor_id=${u.rows[0].id} role=${u.rows[0].role}` : 'no rows',
        pass: u.rowCount === 1 });
      if (u.rowCount === 1) recordIds.vendorUserId = u.rows[0].id;
    } catch (e) {
      record({ id: 'P0.2', action: 'Reset vendor password', method: 'SQL', path: 'UPDATE users',
        expected: 1, actual: 'ERR', ms: Date.now() - start, evidence: e.message, pass: false });
    }
  }

  // 0.3 register guest
  {
    const guestEmail = `qa.guest+rbac.${Date.now()}@example.test`;
    const r = await call({ method: 'POST', path: '/api/users/register',
      body: { name: 'QA RBAC Guest', email: guestEmail, password: 'Password123!', phoneNumber: 5550100 } });
    const ok = (r.status === 200 || r.status === 201) && (r.body?.token || r.body?.user || r.body?.message);
    record({ id: 'P0.3', action: 'Register guest', method: 'POST', path: '/api/users/register',
      expected: '200/201', actual: r.status, ms: r.ms,
      evidence: ok ? `email=${guestEmail}` : '', pass: ok, extra: ok ? null : r.body });
    if (ok) {
      recordIds.guestEmail = guestEmail;
      recordIds.guestUserId = r.body?.user?.id || null;
    }
  }

  // 0.4 login admin
  {
    const r = await call({ method: 'POST', path: '/api/users/login',
      body: { email: 'admin@admin.com', password: 'admin123' } });
    const ok = r.status === 200 && r.body?.token;
    record({ id: 'P0.4', action: 'Login admin', method: 'POST', path: '/api/users/login',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `user.id=${r.body.user.id} isAdmin=${r.body.user.isAdmin}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) tokens.adminToken = r.body.token;
  }

  // 0.5 login vendor
  {
    const r = await call({ method: 'POST', path: '/api/users/login',
      body: { email: 'bro@example.com', password: 'vendor123' } });
    const ok = r.status === 200 && r.body?.token;
    record({ id: 'P0.5', action: 'Login vendor', method: 'POST', path: '/api/users/login',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `user.id=${r.body.user.id} role=${r.body.user.role} isManager=${r.body.user.isManager}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) tokens.vendorToken = r.body.token;
  }

  // 0.6 login guest
  if (recordIds.guestEmail) {
    const r = await call({ method: 'POST', path: '/api/users/login',
      body: { email: recordIds.guestEmail, password: 'Password123!' } });
    const ok = r.status === 200 && r.body?.token;
    record({ id: 'P0.6', action: 'Login guest', method: 'POST', path: '/api/users/login',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `user.id=${r.body.user.id} role=${r.body.user.role}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) {
      tokens.guestToken = r.body.token;
      if (!recordIds.guestUserId) recordIds.guestUserId = r.body.user.id;
    }
  }
}

// ── Phase 1 — Admin role ────────────────────────────────────────────────────
async function phase1Admin() {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  const adminHeader = auth(tokens.adminToken);

  // A1 create hotel
  {
    const r = await call({ method: 'POST', path: '/api/hotels/admin/create',
      headers: adminHeader,
      body: {
        name: 'TEST RBAC Hotel',
        address: 'Sultanahmet Square, Istanbul',
        location: 'Sultanahmet, Istanbul',
        description: 'Hotel created by automated RBAC test runner.',
        status: 'active',
        starRating: 4,
        totalRooms: 10
      } });
    const created = r.body?.hotel || r.body?.data || r.body;
    const hid = created?.id || r.body?.id;
    const ok = (r.status === 200 || r.status === 201) && hid;
    record({ id: 'A1', action: 'Admin create hotel', method: 'POST', path: '/api/hotels/admin/create',
      expected: '200/201', actual: r.status, ms: r.ms,
      evidence: ok ? `hotel.id=${hid} name="${created?.name}"` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) recordIds.hotelId = hid;
  }

  // A2 publicly visible
  if (recordIds.hotelId) {
    const r = await call({ method: 'GET', path: `/api/hotels/public/${recordIds.hotelId}` });
    const h = r.body?.hotel || r.body;
    const ok = r.status === 200 && (h?.id == recordIds.hotelId || h?.name?.includes('TEST RBAC'));
    record({ id: 'A2', action: 'Public can read hotel by id', method: 'GET', path: `/api/hotels/public/${recordIds.hotelId}`,
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `name="${h?.name}" location="${h?.location}"` : '',
      pass: ok, extra: ok ? null : r.body });
  }

  // A3 admin lists hotels
  {
    const r = await call({ method: 'GET', path: '/api/hotels/admin', headers: adminHeader });
    const list = r.body?.hotels || r.body?.data || (Array.isArray(r.body) ? r.body : []);
    const found = list.find?.((h) => h.id == recordIds.hotelId) || null;
    const ok = r.status === 200 && !!found;
    record({ id: 'A3', action: 'Admin lists hotels (sees ours)', method: 'GET', path: '/api/hotels/admin',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${list.length} contains_test_hotel=true` : `total=${list.length}`,
      pass: ok });
  }

  // A4 assign vendor
  if (recordIds.hotelId && recordIds.vendorUserId) {
    const r = await call({ method: 'PATCH', path: `/api/admin/hotels/${recordIds.hotelId}/assign-vendor`,
      headers: adminHeader,
      body: { vendorId: recordIds.vendorUserId } });
    const ok = r.status === 200 || r.status === 204;
    record({ id: 'A4', action: 'Admin assign vendor to hotel', method: 'PATCH', path: `/api/admin/hotels/${recordIds.hotelId}/assign-vendor`,
      expected: '200/204', actual: r.status, ms: r.ms,
      evidence: ok ? `vendor_id=${recordIds.vendorUserId} → hotel ${recordIds.hotelId}` : '',
      pass: ok, extra: ok ? null : r.body });
  }

  // A5 update hotel
  if (recordIds.hotelId) {
    const r = await call({ method: 'PUT', path: `/api/hotels/admin/${recordIds.hotelId}/update`,
      headers: adminHeader,
      body: { description: 'Updated by RBAC test runner at ' + new Date().toISOString() } });
    const ok = r.status === 200 || r.status === 204;
    record({ id: 'A5', action: 'Admin update hotel description', method: 'PUT', path: `/api/hotels/admin/${recordIds.hotelId}/update`,
      expected: '200/204', actual: r.status, ms: r.ms,
      evidence: ok ? 'description updated' : '',
      pass: ok, extra: ok ? null : r.body });
  }

  // A6 admin lists users
  {
    const r = await call({ method: 'GET', path: '/api/admin/users', headers: adminHeader });
    const users = r.body?.users || r.body?.data || (Array.isArray(r.body) ? r.body : []);
    const seesGuest = users.find?.((u) => u.id == recordIds.guestUserId || u.email === recordIds.guestEmail);
    const ok = r.status === 200 && !!seesGuest;
    record({ id: 'A6', action: 'Admin lists users (sees new guest)', method: 'GET', path: '/api/admin/users',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${users.length} contains_guest=true` : `total=${users.length}`,
      pass: ok });
  }

  // A7 add room (via vendor endpoint with admin token — admin bypasses ownership check)
  if (recordIds.hotelId) {
    const r = await call({ method: 'POST', path: '/api/vendor/rooms', headers: adminHeader,
      body: {
        hotelId: recordIds.hotelId,
        name: 'TEST RBAC Standard Room',
        category: 'standard',
        occupancyType: 'double',
        maxGuests: 2,
        basePrice: 90,
        minPrice: 75,
        maxPrice: 120,
        totalRooms: 5
      } });
    const room = r.body?.room || r.body;
    const ok = (r.status === 200 || r.status === 201) && room?.id;
    record({ id: 'A7', action: 'Admin add room to hotel', method: 'POST', path: '/api/vendor/rooms',
      expected: '200/201', actual: r.status, ms: r.ms,
      evidence: ok ? `room.id=${room.id} hotel_id=${room.hotel_id}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) recordIds.roomId = room.id;
  }
}

// ── Phase 2 — Vendor role ───────────────────────────────────────────────────
async function phase2Vendor() {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  const vendorHeader = auth(tokens.vendorToken);

  // V1 vendor lists own hotels
  {
    const r = await call({ method: 'GET', path: '/api/vendor/hotels', headers: vendorHeader });
    const hotels = r.body?.hotels || r.body?.data || (Array.isArray(r.body) ? r.body : []);
    const seesIt = hotels.find?.((h) => h.id == recordIds.hotelId);
    const ok = r.status === 200 && !!seesIt;
    record({ id: 'V1', action: 'Vendor sees assigned hotel', method: 'GET', path: '/api/vendor/hotels',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${hotels.length} contains_test_hotel=true` : `total=${hotels.length}`,
      pass: ok, extra: ok ? null : r.body });
  }

  // V2 vendor lists rooms
  {
    const r = await call({ method: 'GET', path: `/api/vendor/rooms?hotelId=${recordIds.hotelId}`, headers: vendorHeader });
    const rooms = r.body?.rooms || (Array.isArray(r.body) ? r.body : []);
    const seesIt = rooms.find?.((rm) => rm.id == recordIds.roomId);
    const ok = r.status === 200 && !!seesIt;
    record({ id: 'V2', action: 'Vendor sees room', method: 'GET', path: `/api/vendor/rooms?hotelId=${recordIds.hotelId}`,
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${rooms.length} contains_test_room=true` : `total=${rooms.length}`,
      pass: ok, extra: ok ? null : r.body });
  }

  // V3 vendor sets price band
  if (recordIds.roomId) {
    const r = await call({ method: 'PATCH', path: `/api/vendor/rooms/${recordIds.roomId}/price-band`,
      headers: vendorHeader,
      body: { minPrice: 60, maxPrice: 200 } });
    const ok = r.status === 200 || r.status === 204;
    record({ id: 'V3', action: 'Vendor set room price band', method: 'PATCH', path: `/api/vendor/rooms/${recordIds.roomId}/price-band`,
      expected: '200/204', actual: r.status, ms: r.ms,
      evidence: ok ? 'min=60 max=200' : '',
      pass: ok, extra: ok ? null : r.body });
  }

  // V4 vendor creates a booking on behalf of a walk-in guest
  if (recordIds.roomId) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const dayAfter = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
    const r = await call({ method: 'POST', path: '/api/bookings/bookroom',
      headers: vendorHeader,
      body: {
        room: { id: recordIds.roomId, name: 'TEST RBAC Standard Room' },
        fromdate: tomorrow,
        todate: dayAfter,
        totalamount: 180,
        totaldays: 2,
        bookedRooms: 1,
        email: 'walkin.guest@example.test',
        phoneNumber: '15550199',
        paymentMode: 'card',
        transactionId: `RBAC-VENDOR-${Date.now()}`,
        specialRequest: 'Booking created by vendor on behalf of walk-in.'
      } });
    const b = r.body?.booking || r.body;
    const ok = (r.status === 200 || r.status === 201) && b?.id;
    record({ id: 'V4', action: 'Vendor create booking (walk-in)', method: 'POST', path: '/api/bookings/bookroom',
      expected: '200/201', actual: r.status, ms: r.ms,
      evidence: ok ? `booking.id=${b.id} userid=${b.userid || b.userId} dates=${tomorrow}→${dayAfter}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) recordIds.vendorBookingId = b.id;
  }

  // V5 vendor lists bookings
  {
    const r = await call({ method: 'GET', path: '/api/vendor/bookings', headers: vendorHeader });
    const bookings = r.body?.bookings || (Array.isArray(r.body) ? r.body : []);
    const seesIt = bookings.find?.((b) => b.id == recordIds.vendorBookingId);
    const ok = r.status === 200 && !!seesIt;
    record({ id: 'V5', action: 'Vendor sees own booking', method: 'GET', path: '/api/vendor/bookings',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${bookings.length} contains_vendor_booking=true` : `total=${bookings.length}`,
      pass: ok, extra: ok ? null : r.body });
  }
}

// ── Phase 3 — User (guest) role ─────────────────────────────────────────────
async function phase3User() {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  const guestHeader = auth(tokens.guestToken);

  // U1 browse public list
  {
    const r = await call({ method: 'GET', path: '/api/hotels/public?limit=50' });
    const list = r.body?.hotels || (Array.isArray(r.body) ? r.body : []);
    const seesIt = list.find?.((h) => h.id == recordIds.hotelId);
    const ok = r.status === 200 && !!seesIt;
    record({ id: 'U1', action: 'Guest browses public hotels', method: 'GET', path: '/api/hotels/public?limit=50',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${list.length} contains_test_hotel=true` : `total=${list.length}`,
      pass: ok });
  }

  // U2 fetch by id
  if (recordIds.hotelId) {
    const r = await call({ method: 'GET', path: `/api/hotels/public/${recordIds.hotelId}` });
    const h = r.body?.hotel || r.body;
    const ok = r.status === 200 && (h?.id == recordIds.hotelId);
    record({ id: 'U2', action: 'Guest fetches hotel detail', method: 'GET', path: `/api/hotels/public/${recordIds.hotelId}`,
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `name="${h?.name}"` : '',
      pass: ok });
  }

  // U3 guest creates booking for self
  if (recordIds.roomId) {
    const fromD = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
    const toD = new Date(Date.now() + 16 * 86400000).toISOString().slice(0, 10);
    const r = await call({ method: 'POST', path: '/api/bookings/bookroom', headers: guestHeader,
      body: {
        room: { id: recordIds.roomId, name: 'TEST RBAC Standard Room' },
        fromdate: fromD,
        todate: toD,
        totalamount: 180,
        totaldays: 2,
        bookedRooms: 1,
        email: recordIds.guestEmail,
        phoneNumber: '15550100',
        paymentMode: 'card',
        transactionId: `RBAC-USER-${Date.now()}`,
        specialRequest: 'Self-booking by registered guest.'
      } });
    const b = r.body?.booking || r.body;
    const ok = (r.status === 200 || r.status === 201) && b?.id;
    record({ id: 'U3', action: 'Guest creates own booking', method: 'POST', path: '/api/bookings/bookroom',
      expected: '200/201', actual: r.status, ms: r.ms,
      evidence: ok ? `booking.id=${b.id} userid=${b.userid || b.userId} dates=${fromD}→${toD}` : '',
      pass: ok, extra: ok ? null : r.body });
    if (ok) recordIds.userBookingId = b.id;
  }

  // U4 guest lists own bookings
  {
    const r = await call({ method: 'POST', path: '/api/bookings/getbookingsbyuserid',
      headers: auth(tokens.guestToken),
      body: { userid: recordIds.guestUserId } });
    const bookings = r.body?.bookings || (Array.isArray(r.body) ? r.body : []);
    const seesIt = bookings.find?.((b) => b.id == recordIds.userBookingId);
    const ok = r.status === 200 && !!seesIt;
    record({ id: 'U4', action: 'Guest lists own bookings', method: 'POST', path: '/api/bookings/getbookingsbyuserid',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `total=${bookings.length} contains_self_booking=true` : `total=${bookings.length}`,
      pass: ok, extra: ok ? null : r.body });
  }
}

// ── Phase 4 — Cross-role visibility ─────────────────────────────────────────
async function phase4Cross() {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });

  // X1 admin stats — sanity check
  {
    const r = await call({ method: 'GET', path: '/api/admin/stats', headers: auth(tokens.adminToken) });
    const totals = r.body?.totals || r.body;
    const ok = r.status === 200 && totals && (totals.hotels !== undefined || totals.bookings !== undefined);
    record({ id: 'X1', action: 'Admin reads global stats', method: 'GET', path: '/api/admin/stats',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: ok ? `hotels=${totals.hotels} bookings=${totals.bookings} revenue=${totals.revenue}` : '',
      pass: ok, extra: ok ? null : r.body });
  }

  // X2 vendor sees both bookings
  {
    const r = await call({ method: 'GET', path: '/api/vendor/bookings', headers: auth(tokens.vendorToken) });
    const list = r.body?.bookings || [];
    const sawV = recordIds.vendorBookingId && list.find?.((b) => b.id == recordIds.vendorBookingId);
    const sawU = recordIds.userBookingId && list.find?.((b) => b.id == recordIds.userBookingId);
    const ok = r.status === 200 && sawV && sawU;
    record({ id: 'X2', action: 'Vendor sees BOTH bookings on their hotel', method: 'GET', path: '/api/vendor/bookings',
      expected: 200, actual: r.status, ms: r.ms,
      evidence: `vendor_booking=${!!sawV} user_booking=${!!sawU} total=${list.length}`,
      pass: ok });
  }

  // X3 direct Neon DB check
  {
    const start = Date.now();
    try {
      const h = await pool.query(`SELECT id, name, status, vendor_id FROM hotels WHERE id = $1`, [recordIds.hotelId]);
      const ids = [recordIds.vendorBookingId, recordIds.userBookingId].filter(Boolean);
      const b = ids.length
        ? await pool.query(`SELECT id, userid, roomid, fromdate, todate FROM bookings WHERE id = ANY($1::int[]) ORDER BY id`, [ids])
        : { rows: [] };
      const ok = h.rowCount === 1 && b.rows.length === ids.length;
      record({ id: 'X3', action: 'Direct DB confirms hotel + bookings persisted', method: 'SQL', path: 'SELECT … FROM hotels/bookings',
        expected: 'hotel=1, bookings=2', actual: `hotel=${h.rowCount}, bookings=${b.rows.length}`, ms: Date.now() - start,
        evidence: `hotel.vendor_id=${h.rows[0]?.vendor_id} booking_user_ids=[${b.rows.map((r) => r.userid).join(',')}]`,
        pass: ok });
    } catch (e) {
      record({ id: 'X3', action: 'Direct DB check', method: 'SQL', path: 'SELECT …',
        expected: 'rows', actual: 'ERR', ms: Date.now() - start, evidence: e.message, pass: false });
    }
  }
}

// ── Phase 5 — Negative RBAC ─────────────────────────────────────────────────
async function phase5Negative() {
  const auth = (t) => ({ Authorization: `Bearer ${t}` });

  // N1 guest forbidden from admin create
  {
    const r = await call({ method: 'POST', path: '/api/hotels/admin/create',
      headers: auth(tokens.guestToken),
      body: { name: 'TEST RBAC SHOULD NOT EXIST', address: 'should be rejected' } });
    const ok = r.status === 403 || r.status === 401;
    record({ id: 'N1', action: 'Guest blocked from admin create', method: 'POST', path: '/api/hotels/admin/create',
      expected: '401/403', actual: r.status, ms: r.ms,
      evidence: r.body?.error || r.body?.message || '',
      pass: ok, extra: ok ? null : r.body });
  }

  // N2 vendor forbidden from admin create
  {
    const r = await call({ method: 'POST', path: '/api/hotels/admin/create',
      headers: auth(tokens.vendorToken),
      body: { name: 'TEST RBAC SHOULD NOT EXIST 2', address: 'should be rejected' } });
    const ok = r.status === 403 || r.status === 401;
    record({ id: 'N2', action: 'Vendor blocked from admin create', method: 'POST', path: '/api/hotels/admin/create',
      expected: '401/403', actual: r.status, ms: r.ms,
      evidence: r.body?.error || r.body?.message || '',
      pass: ok, extra: ok ? null : r.body });
  }

  // N3 unauthenticated forbidden from admin users
  {
    const r = await call({ method: 'GET', path: '/api/admin/users' });
    const ok = r.status === 401 || r.status === 403;
    record({ id: 'N3', action: 'Anon blocked from admin users', method: 'GET', path: '/api/admin/users',
      expected: '401/403', actual: r.status, ms: r.ms,
      evidence: r.body?.error || r.body?.message || '',
      pass: ok, extra: ok ? null : r.body });
  }

  // N4 vendor forbidden from admin stats
  {
    const r = await call({ method: 'GET', path: '/api/admin/stats', headers: auth(tokens.vendorToken) });
    const ok = r.status === 401 || r.status === 403;
    record({ id: 'N4', action: 'Vendor blocked from admin stats', method: 'GET', path: '/api/admin/stats',
      expected: '401/403', actual: r.status, ms: r.ms,
      evidence: r.body?.error || r.body?.message || '',
      pass: ok, extra: ok ? null : r.body });
  }
}

// ── Markdown report ─────────────────────────────────────────────────────────
function mdReport() {
  const total = results.length;
  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass);
  const trunc = (s, n = 24) => (s ? String(s).slice(0, n) + (String(s).length > n ? '…' : '') : '');

  let out = '\n================  RBAC TEST REPORT  ================\n\n';
  out += `Backend: ${BASE}\n`;
  out += `Database: Neon Postgres (via db.postgres.js)\n`;
  out += `Generated: ${new Date().toISOString()}\n\n`;
  out += `## Actor accounts\n\n`;
  out += `| Role | Email | Password | Token (truncated) |\n`;
  out += `|---|---|---|---|\n`;
  out += `| Admin | admin@admin.com | admin123 | ${trunc(tokens.adminToken, 24)} |\n`;
  out += `| Vendor | bro@example.com | vendor123 | ${trunc(tokens.vendorToken, 24)} |\n`;
  out += `| Guest | ${recordIds.guestEmail || '(register failed)'} | Password123! | ${trunc(tokens.guestToken, 24)} |\n\n`;
  out += `## Records created in Neon\n\n`;
  out += `- hotel.id = **${recordIds.hotelId || '—'}** (name: TEST RBAC Hotel)\n`;
  out += `- room.id = **${recordIds.roomId || '—'}** (name: TEST RBAC Standard Room)\n`;
  out += `- vendor booking.id = **${recordIds.vendorBookingId || '—'}**\n`;
  out += `- guest booking.id = **${recordIds.userBookingId || '—'}**\n`;
  out += `- guest user.id = **${recordIds.guestUserId || '—'}**\n\n`;
  out += `## Results\n\n`;
  out += `| # | Action | Method | Path | Expected | Actual | Latency | Evidence | Pass |\n`;
  out += `|---|---|---|---|---|---|---|---|---|\n`;
  for (const r of results) {
    out += `| ${r.id} | ${r.action} | ${r.method} | \`${r.path}\` | ${r.expected} | ${r.actual} | ${r.ms} ms | ${(r.evidence || '').replace(/\|/g, '\\|').slice(0, 100)} | ${r.pass ? '✅' : '❌'} |\n`;
  }
  out += `\n**Summary: ${passed}/${total} passed**`;
  if (failed.length) {
    out += ` — ${failed.length} failure(s):\n\n`;
    for (const f of failed) {
      out += `- **${f.id}** ${f.action} → ${f.method} ${f.path} → got ${f.actual}, expected ${f.expected}\n`;
      if (f.extra) out += `  - response: \`${(typeof f.extra === 'string' ? f.extra : JSON.stringify(f.extra)).slice(0, 240)}\`\n`;
    }
  } else {
    out += `. All RBAC paths working end-to-end.\n`;
  }
  out += `\n## Inspect in Neon\n\n`;
  out += `\`\`\`sql\n`;
  out += `-- The test hotel + room\n`;
  out += `SELECT id, name, status, vendor_id FROM hotels WHERE name LIKE 'TEST RBAC%';\n`;
  out += `SELECT id, hotel_id, name, category, price_per_night, min_price, max_price FROM rooms WHERE name LIKE 'TEST RBAC%';\n\n`;
  out += `-- Bookings created\n`;
  out += `SELECT id, userid, roomid, fromdate, todate, totalamount, status FROM bookings WHERE id IN (${[recordIds.vendorBookingId, recordIds.userBookingId].filter(Boolean).join(',') || 'NULL'});\n`;
  out += `\`\`\`\n`;
  return out;
}

(async () => {
  console.log('\n=== RBAC TEST RUN START ===\n');
  try {
    await phase0Setup();
    if (!tokens.adminToken || !tokens.vendorToken || !tokens.guestToken) {
      console.error('\nABORT: missing one or more JWTs after phase 0; cannot continue.');
    } else {
      await phase1Admin();
      await phase2Vendor();
      await phase3User();
      await phase4Cross();
      await phase5Negative();
    }
  } catch (e) {
    console.error('FATAL:', e);
  } finally {
    console.log(mdReport());
    await pool.end();
    const fails = results.filter((r) => !r.pass).length;
    process.exit(fails ? 1 : 0);
  }
})();
