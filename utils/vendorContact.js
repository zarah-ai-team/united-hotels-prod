// Resolve where a vendor/property booking notification should go for a hotel.
//
// Priority: the hotel's own contact email column → the owning vendor user's
// email (hotels.vendor_id → users.email) → BOOKING_OPS_INBOX / SUPPORT_INBOX,
// so a booking notification is never lost silently. Schema-tolerant: missing
// columns are skipped rather than throwing.
//
// `db` is anything with a `.query(text, params)` method — the pg Pool or a
// transaction client both work.

const pickColumn = (cols, candidates) => candidates.find((c) => cols.has(c)) || null;

const resolveHotelVendorContact = async (db, hotelId) => {
  const opsFallback = process.env.BOOKING_OPS_INBOX || process.env.SUPPORT_INBOX || null;
  if (!hotelId) {
    return { hotelName: null, to: opsFallback, vendorName: null, vendorEmail: null };
  }

  let cols = new Set();
  try {
    const colRes = await db.query(
      `SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels'`
    );
    cols = new Set(colRes.rows.map((r) => r.column_name));
  } catch (e) {
    console.warn('[vendorContact] hotels column lookup failed:', e.message);
  }

  const nameCol = pickColumn(cols, ['hotel_name', 'name']);
  const vendorIdCol = pickColumn(cols, ['vendor_id', 'vendorid', 'vendorId', 'provider_id', 'providerid']);
  const hotelEmailCol = pickColumn(cols, ['email', 'contact_email', 'contactemail']);

  const select = [
    nameCol ? `"${nameCol}" AS hotel_name` : `NULL AS hotel_name`,
    vendorIdCol ? `"${vendorIdCol}" AS vendor_id` : `NULL AS vendor_id`,
    hotelEmailCol ? `"${hotelEmailCol}" AS hotel_email` : `NULL AS hotel_email`,
  ].join(', ');

  let hotelRow = {};
  try {
    const result = await db.query(`SELECT ${select} FROM hotels WHERE id = $1 LIMIT 1`, [hotelId]);
    hotelRow = result.rows[0] || {};
  } catch (e) {
    console.warn('[vendorContact] hotel lookup failed:', e.message);
  }

  let vendorEmail = null;
  let vendorName = null;
  if (hotelRow.vendor_id) {
    try {
      const vendorResult = await db.query(`SELECT email, name FROM users WHERE id = $1 LIMIT 1`, [hotelRow.vendor_id]);
      vendorEmail = vendorResult.rows[0]?.email || null;
      vendorName = vendorResult.rows[0]?.name || null;
    } catch (e) {
      console.warn('[vendorContact] vendor user lookup failed:', e.message);
    }
  }

  const to = hotelRow.hotel_email || vendorEmail || opsFallback;
  return { hotelName: hotelRow.hotel_name || null, to, vendorName, vendorEmail };
};

module.exports = { resolveHotelVendorContact };
