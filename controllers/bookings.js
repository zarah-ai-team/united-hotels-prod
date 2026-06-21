const moment = require("moment");
const pool = require("../db");
const sendMail = require("../utils/mailer");
const { sendBookingConfirmationEmail: sendBookingConfirmationEmailResend } = require('../utils/emails/bookingConfirmationEmail');
const { sendVendorBookingNotification } = require('../utils/emails/vendorBookingNotification');
const { sendBookingCancellationEmail } = require('../utils/emails/bookingCancellationEmail');
const pos = require('../utils/isbankPos');
// Resolve the guest's country via the priority chain in utils/geoip.js
// (explicit body → Cloudflare/Vercel header → IP lookup → Accept-Language).
const { detectCountry } = require('../utils/geoip');

const FRONTEND_URL = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

const computeNights = (fromDate, toDate) => {
    if (!fromDate || !toDate) return 1;
    const a = new Date(fromDate);
    const b = new Date(toDate);
    if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1;
    return Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
};

let userPhoneColumnCache = null;
let hotelColumnsMetaCache = null;
let roomColumnsMetaCache = null;
let bookingColumnsCache = null;
let bookingMetaCache = null;

const quoteIdentifier = (identifier) => `"${String(identifier).replace(/"/g, '""')}"`;

const getBookingMeta = async (client) => {
    if (bookingMetaCache) {
        return bookingMetaCache;
    }

    const result = await client.query(
        `SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = 'bookings'`
    );
    const columns = new Set(result.rows.map((row) => row.column_name));
    const nullable = new Map(result.rows.map((row) => [row.column_name, row.is_nullable]));

    bookingMetaCache = {
        columns,
        nullable,
        roomTextCol: pickExistingColumn(columns, ['room', 'room_name']),
        roomIdCol: pickExistingColumn(columns, ['roomid', 'room_id']),
        hotelIdCol: pickExistingColumn(columns, ['hotelid', 'hotel_id']),
        userIdCol: pickExistingColumn(columns, ['userid', 'user_id', 'userId']),
        fromDateCol: pickExistingColumn(columns, ['fromdate', 'check_in_date']),
        toDateCol: pickExistingColumn(columns, ['todate', 'check_out_date']),
        totalAmountCol: pickExistingColumn(columns, ['totalamount', 'total_price']),
        totalDaysCol: pickExistingColumn(columns, ['totaldays']),
        statusCol: pickExistingColumn(columns, ['status']),
        paymentModeCol: pickExistingColumn(columns, ['payment_mode']),
        transactionIdCol: pickExistingColumn(columns, ['transactionid', 'transaction_id', 'transactionId']),
        specialRequestCol: pickExistingColumn(columns, ['special_request', 'specialrequest']),
        guestNameCol: pickExistingColumn(columns, ['guest_name', 'guestname']),
        guestEmailCol: pickExistingColumn(columns, ['guest_email', 'guestemail']),
        guestPhoneCol: pickExistingColumn(columns, ['guest_phone', 'guestphone']),
        guestsCol: pickExistingColumn(columns, ['guests']),
        adultsCol: pickExistingColumn(columns, ['adults', 'num_adults']),
        childrenCol: pickExistingColumn(columns, ['children', 'num_children']),
        bookedRoomsCol: pickExistingColumn(columns, ['booked_rooms', 'bookedrooms']),
        currencyCol: pickExistingColumn(columns, ['currency']),
        createdCol: pickExistingColumn(columns, ['created_at', 'createdAt']),
        updatedCol: pickExistingColumn(columns, ['updated_at', 'updatedAt'])
    };

    return bookingMetaCache;
};

const getBookingColumns = async (client) => {
    if (bookingColumnsCache) return bookingColumnsCache;
    const meta = await getBookingMeta(client);
    bookingColumnsCache = meta.columns;
    return bookingColumnsCache;
};

const ensureBookingPaymentColumns = async (client) => {
    const meta = await getBookingMeta(client);

    if (meta.userIdCol && meta.nullable.get(meta.userIdCol) === 'NO') {
        await client.query(`
            ALTER TABLE bookings
            ALTER COLUMN ${quoteIdentifier(meta.userIdCol)} DROP NOT NULL;
        `);
        bookingMetaCache = null;
        bookingColumnsCache = null;
    }
};

// Bring legacy bookings tables up to the column set the controller wants to
// write. Idempotent — safe to call on every BookRoom invocation; PG ignores
// columns that already exist. Runs once per process via the cache flag.
let bookingExtendedColumnsEnsured = false;
const ensureBookingExtendedColumns = async (client) => {
    if (bookingExtendedColumnsEnsured) return;
    await client.query(`
        ALTER TABLE bookings
            ADD COLUMN IF NOT EXISTS payment_mode    text,
            ADD COLUMN IF NOT EXISTS special_request text,
            ADD COLUMN IF NOT EXISTS hotelid         integer,
            ADD COLUMN IF NOT EXISTS guest_name      text,
            ADD COLUMN IF NOT EXISTS guest_email     text,
            ADD COLUMN IF NOT EXISTS guest_phone     text,
            ADD COLUMN IF NOT EXISTS guests          integer,
            ADD COLUMN IF NOT EXISTS adults          integer,
            ADD COLUMN IF NOT EXISTS children        integer,
            ADD COLUMN IF NOT EXISTS booked_rooms    integer,
            ADD COLUMN IF NOT EXISTS currency        text;
    `);
    // Reset metadata cache so the next read picks up the new columns.
    bookingMetaCache = null;
    bookingColumnsCache = null;
    bookingExtendedColumnsEnsured = true;
};

const getHotelColumnsMeta = async (client) => {
    if (hotelColumnsMetaCache) {
        return hotelColumnsMetaCache;
    }

    const result = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels'`
    );
    const cols = new Set(result.rows.map((r) => r.column_name));
    hotelColumnsMetaCache = {
        totalRoomsCol: cols.has('total_rooms') ? 'total_rooms' : (cols.has('totalRooms') ? 'totalRooms' : null),
        dataCol: cols.has('data') ? 'data' : null,
        updatedCol: cols.has('updated_at') ? 'updated_at' : (cols.has('updatedAt') ? 'updatedAt' : null)
    };

    return hotelColumnsMetaCache;
};

const getRoomColumnsMeta = async (client) => {
    if (roomColumnsMetaCache) {
        return roomColumnsMetaCache;
    }

    const result = await client.query(
        `SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'rooms'`
    );
    const cols = new Set(result.rows.map((r) => r.column_name));
    const currentBookingsRow = result.rows.find((r) => r.column_name === 'currentbookings');
    roomColumnsMetaCache = {
        availableRoomsCol: cols.has('available_rooms') ? 'available_rooms' : (cols.has('availableRooms') ? 'availableRooms' : null),
        totalRoomsCol: cols.has('total_rooms') ? 'total_rooms' : (cols.has('totalRooms') ? 'totalRooms' : null),
        availableCol: cols.has('is_available') ? 'is_available' : null,
        updatedCol: cols.has('updated_at') ? 'updated_at' : (cols.has('updatedAt') ? 'updatedAt' : null),
        currentBookingsIsArray: currentBookingsRow?.data_type === 'ARRAY'
    };

    return roomColumnsMetaCache;
};

// rooms.currentbookings can be either a Postgres array (e.g. json[]) or a
// scalar text/jsonb column depending on when the schema was provisioned.
// Wrong serialization triggers "malformed array literal" and rolls back the
// whole booking transaction, so we detect once and bind the right shape.
const serializeCurrentBookings = async (client, entries) => {
    const meta = await getRoomColumnsMeta(client);
    const list = Array.isArray(entries) ? entries : [];
    if (meta.currentBookingsIsArray) {
        return list.map((entry) => (typeof entry === 'string' ? entry : JSON.stringify(entry)));
    }
    return JSON.stringify(list);
};

const toInt = (value) => {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
};

const pickExistingColumn = (columns, names) => names.find((name) => columns.has(name)) || null;

const normalizeDateInput = (dateValue) => {
    const formatted = moment(dateValue).format("YYYY-MM-DD");
    return formatted === 'Invalid date' ? null : formatted;
};

const normalizeBookingRecord = (row) => ({
    ...row,
    hotelId: row.hotelid ?? row.hotel_id ?? null,
    roomId: row.roomid ?? row.room_id ?? null,
    userId: row.userid ?? row.user_id ?? row.userId ?? null,
    fromDate: row.fromdate ?? row.check_in_date ?? null,
    toDate: row.todate ?? row.check_out_date ?? null,
    totalAmount: row.totalamount ?? row.total_price ?? null,
    paymentMode: row.payment_mode ?? row.method ?? null,
    transactionId: row.transactionid ?? row.transaction_id ?? row.transactionId ?? null,
    specialRequest: row.special_request ?? row.specialrequest ?? null,
    guestName: row.guest_name ?? row.guestname ?? null,
    guestEmail: row.guest_email ?? row.guestemail ?? null,
    guestPhone: row.guest_phone ?? row.guestphone ?? null,
    guests: row.guests ?? null,
    adults: row.adults ?? null,
    children: row.children ?? null,
    bookedRooms: row.booked_rooms ?? row.bookedrooms ?? null,
    currency: row.currency ?? null
});

// Fetch bookings joined with their hotel's name/location/address/image so the
// client (guest portal, admin) can render full booking cards instead of generic
// "Hotel #id" placeholders. The room name already lives on the booking's `room`
// column. Falls back to a plain select if the hotels join isn't possible on the
// current schema (e.g. a differently-named hotel id column).
const fetchBookingsEnriched = async (whereSql, params, userIdCol, orderCol) => {
    const where = whereSql ? ` WHERE ${whereSql}` : '';
    try {
        return await pool.query(
            `SELECT b.*,
                    h.name     AS hotel_name,
                    h.location AS location,
                    h.address  AS address,
                    h.image    AS hotel_image
               FROM bookings b
               LEFT JOIN hotels h ON h.id = b.hotelid${where}
              ORDER BY b.${orderCol} DESC`,
            params
        );
    } catch (joinErr) {
        console.warn('[bookings] hotel enrich join failed, falling back to plain select:', joinErr.message);
        const plainWhere = whereSql ? ` WHERE ${whereSql.replace(/\bb\./g, '')}` : '';
        return pool.query(
            `SELECT * FROM bookings${plainWhere} ORDER BY ${orderCol} DESC`,
            params
        );
    }
};

const createBookingRecord = async ({
    client,
    roomData,
    roomName,
    effectiveUserId,
    fromDate,
    toDate,
    totalAmount,
    totalDays,
    hotelId,
    transactionId,
    paymentMode,
    specialRequest,
    guestName,
    guestEmail,
    guestPhone,
    guests,
    adults,
    children,
    bookedRooms,
    currency
}) => {
    await ensureBookingExtendedColumns(client);
    await ensureBookingPaymentColumns(client);
    const meta = await getBookingMeta(client);
    const resolvedTransactionId =
        transactionId ||
        `BOOK-${effectiveUserId || 'guest'}-${Date.now()}`;
    const resolvedUserId = effectiveUserId ?? null;

    if (meta.userIdCol && meta.nullable.get(meta.userIdCol) === 'NO' && !resolvedUserId) {
        throw new Error('Bookings table requires a user id for this environment. Allow NULL on user column or send userid for guest booking.');
    }

    const columns = [];
    const values = [];

    if (meta.roomTextCol) {
        columns.push(meta.roomTextCol);
        values.push(roomName);
    }
    if (meta.roomIdCol) {
        columns.push(meta.roomIdCol);
        values.push(roomData.id);
    }
    if (meta.hotelIdCol) {
        columns.push(meta.hotelIdCol);
        values.push(hotelId);
    }
    if (meta.userIdCol) {
        columns.push(meta.userIdCol);
        values.push(resolvedUserId);
    }
    if (meta.fromDateCol) {
        columns.push(meta.fromDateCol);
        values.push(fromDate);
    }
    if (meta.toDateCol) {
        columns.push(meta.toDateCol);
        values.push(toDate);
    }
    if (meta.totalAmountCol) {
        columns.push(meta.totalAmountCol);
        values.push(Number(totalAmount));
    }
    if (meta.totalDaysCol) {
        columns.push(meta.totalDaysCol);
        values.push(totalDays);
    }
    if (meta.statusCol) {
        columns.push(meta.statusCol);
        values.push(meta.columns.has('status') ? 'booked' : 'confirmed');
    }
    if (meta.transactionIdCol) {
        columns.push(meta.transactionIdCol);
        values.push(resolvedTransactionId);
    }
    if (meta.paymentModeCol) {
        columns.push(meta.paymentModeCol);
        values.push(paymentMode);
    }
    if (meta.specialRequestCol) {
        columns.push(meta.specialRequestCol);
        values.push(specialRequest || null);
    }
    if (meta.guestNameCol) {
        columns.push(meta.guestNameCol);
        values.push(guestName || null);
    }
    if (meta.guestEmailCol) {
        columns.push(meta.guestEmailCol);
        values.push(guestEmail || null);
    }
    if (meta.guestPhoneCol) {
        columns.push(meta.guestPhoneCol);
        values.push(guestPhone || null);
    }
    if (meta.guestsCol) {
        columns.push(meta.guestsCol);
        values.push(toInt(guests) || null);
    }
    if (meta.adultsCol) {
        columns.push(meta.adultsCol);
        values.push(toInt(adults) || null);
    }
    if (meta.childrenCol) {
        columns.push(meta.childrenCol);
        // children can legitimately be 0; only force null when missing
        const c = toInt(children);
        values.push(Number.isFinite(c) ? c : null);
    }
    if (meta.bookedRoomsCol) {
        columns.push(meta.bookedRoomsCol);
        values.push(toInt(bookedRooms) || null);
    }
    if (meta.currencyCol) {
        columns.push(meta.currencyCol);
        values.push(currency || 'USD');
    }

    if (!meta.roomIdCol || !meta.fromDateCol || !meta.toDateCol || !meta.totalAmountCol) {
        throw new Error('Bookings table is missing required room/date/price columns');
    }

    const placeholders = values.map((_, index) => `$${index + 1}`);
    const timestampColumns = [];
    const timestampValues = [];

    if (meta.createdCol) {
        timestampColumns.push(meta.createdCol);
        timestampValues.push('NOW()');
    }

    if (meta.updatedCol) {
        timestampColumns.push(meta.updatedCol);
        timestampValues.push('NOW()');
    }

    const insertBookingQuery = `
        INSERT INTO bookings (${[...columns, ...timestampColumns].map(quoteIdentifier).join(', ')})
        VALUES (${[...placeholders, ...timestampValues].join(', ')})
        RETURNING *;
    `;

    return client.query(insertBookingQuery, values);
};

const getHotelDisplayName = async (client, hotelId) => {
    if (!hotelId) {
        return null;
    }

    const hotelColumns = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels'`
    );
    const cols = new Set(hotelColumns.rows.map((row) => row.column_name));
    const hotelNameCol = pickExistingColumn(cols, ['hotel_name', 'name']);

    if (!hotelNameCol) {
        return null;
    }

    const result = await client.query(
        `SELECT "${hotelNameCol}" AS hotel_name FROM hotels WHERE id = $1 LIMIT 1`,
        [hotelId]
    );

    return result.rows[0]?.hotel_name || null;
};

// Resolve where a vendor/property booking notification should go for a hotel.
// Priority: the hotel's own contact email column → the owning vendor user's
// email (hotels.vendor_id → users.email) → BOOKING_OPS_INBOX / SUPPORT_INBOX so
// a booking is never lost silently. Schema-tolerant: missing columns are
// skipped rather than throwing. Returns { hotelName, to, vendorName }.
const getHotelContactForEmails = async (client, hotelId) => {
    const opsFallback = process.env.BOOKING_OPS_INBOX || process.env.SUPPORT_INBOX || null;
    if (!hotelId) {
        return { hotelName: null, to: opsFallback, vendorName: null };
    }

    const hotelColumns = await client.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'hotels'`
    );
    const cols = new Set(hotelColumns.rows.map((row) => row.column_name));
    const nameCol = pickExistingColumn(cols, ['hotel_name', 'name']);
    const vendorIdCol = pickExistingColumn(cols, ['vendor_id', 'vendorid', 'vendorId', 'provider_id', 'providerid']);
    const hotelEmailCol = pickExistingColumn(cols, ['email', 'contact_email', 'contactemail']);

    const select = [
        nameCol ? `"${nameCol}" AS hotel_name` : `NULL AS hotel_name`,
        vendorIdCol ? `"${vendorIdCol}" AS vendor_id` : `NULL AS vendor_id`,
        hotelEmailCol ? `"${hotelEmailCol}" AS hotel_email` : `NULL AS hotel_email`,
    ].join(', ');

    let hotelRow = {};
    try {
        const result = await client.query(`SELECT ${select} FROM hotels WHERE id = $1 LIMIT 1`, [hotelId]);
        hotelRow = result.rows[0] || {};
    } catch (e) {
        console.warn('[bookings] hotel contact lookup failed:', e.message);
    }

    let vendorEmail = null;
    let vendorName = null;
    if (hotelRow.vendor_id) {
        try {
            const vendorResult = await client.query(
                `SELECT email, name FROM users WHERE id = $1 LIMIT 1`,
                [hotelRow.vendor_id]
            );
            vendorEmail = vendorResult.rows[0]?.email || null;
            vendorName = vendorResult.rows[0]?.name || null;
        } catch (e) {
            console.warn('[bookings] vendor email lookup failed:', e.message);
        }
    }

    const to = hotelRow.hotel_email || vendorEmail || opsFallback;
    return { hotelName: hotelRow.hotel_name || null, to, vendorName };
};

const sendBookingConfirmationEmail = async ({
    email,
    booking,
    roomName,
    hotelName,
    hotelAddress,
    guestName,
    fromDate,
    toDate,
    totalAmount,
    currency,
}) => {
    if (!email) return;

    // Routes through Resend via utils/emails/bookingConfirmationEmail.
    // The Resend client logs (instead of throwing) when RESEND_API_KEY is
    // unset, so this is safe to call in any env.
    try {
        await sendBookingConfirmationEmailResend({
            to: email,
            guestName: guestName || null,
            bookingId: booking.id,
            hotelName: hotelName || 'United Hotels Partner Property',
            hotelAddress: hotelAddress || null,
            roomName,
            checkIn: fromDate,
            checkOut: toDate,
            nights: computeNights(fromDate, toDate),
            totalAmount,
            currency: currency || 'USD',
            manageUrl: `${FRONTEND_URL()}/portal`,
        });
    } catch (error) {
        console.error('Booking confirmation email failed:', error?.message || error);
    }
};

const getRoomUpdateQuery = async (client) => {
    const meta = await getRoomColumnsMeta(client);
    const assignments = ['currentbookings = $1'];

    if (meta.updatedCol) {
        assignments.push(`"${meta.updatedCol}" = NOW()`);
    }

    return `UPDATE rooms SET ${assignments.join(', ')} WHERE id = $2`;
};

const adjustHotelRoomCount = async (client, hotelId, delta = 0) => {
    if (!hotelId || delta === 0) {
        return;
    }

    const meta = await getHotelColumnsMeta(client);
    if (!meta.totalRoomsCol && !meta.dataCol) {
        return;
    }

    const selectParts = ['id'];
    if (meta.totalRoomsCol) {
        selectParts.push(`"${meta.totalRoomsCol}" AS total_rooms`);
    }
    if (meta.dataCol) {
        selectParts.push(`"${meta.dataCol}" AS data`);
    }

    const hotelResult = await client.query(
        `SELECT ${selectParts.join(', ')} FROM hotels WHERE id = $1 FOR UPDATE`,
        [hotelId]
    );

    if (hotelResult.rowCount === 0) {
        return;
    }

    const hotel = hotelResult.rows[0];
    const currentFromColumn = toInt(hotel.total_rooms);
    const currentFromData = toInt(hotel?.data?.details?.totalRooms);
    const currentTotal = currentFromColumn ?? currentFromData ?? 0;
    const nextTotal = Math.max(currentTotal + delta, 0);

    const updates = [];
    const params = [];

    if (meta.totalRoomsCol) {
        params.push(nextTotal);
        updates.push(`"${meta.totalRoomsCol}" = $${params.length}`);
    }

    if (meta.dataCol) {
        const nextData = {
            ...(hotel.data || {}),
            details: {
                ...((hotel.data && hotel.data.details) || {}),
                totalRooms: nextTotal
            }
        };
        params.push(nextData);
        updates.push(`"${meta.dataCol}" = $${params.length}`);
    }

    if (meta.updatedCol) {
        updates.push(`"${meta.updatedCol}" = NOW()`);
    }

    if (!updates.length) {
        return;
    }

    params.push(hotelId);
    await client.query(
        `UPDATE hotels SET ${updates.join(', ')} WHERE id = $${params.length}`,
        params
    );
};

const adjustRoomCategoryAvailability = async (client, roomRow, delta) => {
    if (!roomRow?.id || !delta) {
        return;
    }

    const meta = await getRoomColumnsMeta(client);
    if (!meta.availableRoomsCol && !meta.availableCol) {
        return;
    }

    const availableRooms = meta.availableRoomsCol ? toInt(roomRow[meta.availableRoomsCol]) ?? 0 : null;
    const nextAvailableRooms = availableRooms === null ? null : Math.max(availableRooms + delta, 0);
    const updates = [];
    const params = [];

    if (meta.availableRoomsCol && nextAvailableRooms !== null) {
        params.push(nextAvailableRooms);
        updates.push(`"${meta.availableRoomsCol}" = $${params.length}`);
    }

    if (meta.availableCol) {
        const nextIsAvailable = nextAvailableRooms === null ? delta >= 0 : nextAvailableRooms > 0;
        params.push(nextIsAvailable);
        updates.push(`"${meta.availableCol}" = $${params.length}`);
    }

    if (meta.updatedCol) {
        updates.push(`"${meta.updatedCol}" = NOW()`);
    }

    if (!updates.length) {
        return;
    }

    params.push(roomRow.id);
    await client.query(`UPDATE rooms SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
};

const getUserPhoneColumn = async () => {
    if (userPhoneColumnCache) {
        return userPhoneColumnCache;
    }

    const result = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
    );
    const columns = new Set(result.rows.map((r) => r.column_name));
    userPhoneColumnCache = columns.has('phoneNumber') ? '"phoneNumber"' : (columns.has('phonenumber') ? 'phonenumber' : null);
    return userPhoneColumnCache;
};

// Book a room (Postgres version, no Stripe)
const BookRoom = async (req, res) => {
    const {
        room,
        userid,
        userId,
        user_id,
        fromdate,
        todate,
        totalamount,
        totaldays,
        email,
        phoneNumber,
        bookedRooms,
        paymentMode,
        transactionId,
        specialRequest,
        guestName,
        guestFirstName,
        guestLastName,
        guests,
        adults,
        children,
        currency
    } = req.body;
    const bookedCount = toInt(bookedRooms) || 1;
    const client = await pool.connect();
    try {
        if (!email || !phoneNumber) {
            return res.status(400).json({ error: 'email and phoneNumber are required' });
        }

        if (!room || (!room.id && !room.roomid && !room._id)) {
            return res.status(400).json({ error: 'room with a valid id is required' });
        }

        const requestedUserId = toInt(userid ?? userId ?? user_id);
        const tokenUserId = req.user?.id ? toInt(req.user.id) : null;
        let effectiveUserId = requestedUserId || tokenUserId || null;

        if (effectiveUserId) {
            const userExistsResult = await client.query('SELECT id FROM users WHERE id = $1 LIMIT 1', [effectiveUserId]);
            if (userExistsResult.rowCount === 0) {
                return res.status(400).json({ error: 'Provided userid does not exist' });
            }
        }

        const isGuestBooking = !effectiveUserId;
        const roomId = room.id || room.roomid || room._id;
        const finalPaymentMode = String(paymentMode || 'card').toLowerCase();
        const transactionUserLabel = effectiveUserId || 'guest';
        const finalTransactionId = transactionId || `BOOK-${transactionUserLabel}-${Date.now()}`;
        const fromDate = normalizeDateInput(fromdate);
        const toDate = normalizeDateInput(todate);
        const normalizedSpecialRequest = typeof specialRequest === 'string' ? specialRequest.trim() : null;

        if (!fromDate || !toDate) {
            return res.status(400).json({ error: 'fromdate and todate are required with valid date values' });
        }

        if (!totalamount || Number(totalamount) <= 0) {
            return res.status(400).json({ error: 'totalamount must be greater than 0' });
        }

        await client.query('BEGIN');

        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [roomId]);
        const roomData = roomResult.rows[0];
        if (!roomData) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Room not found' });
        }

        // Vendor scope: a vendor can only create bookings for hotels they own.
        // Admins bypass; unauthenticated guests and regular users are unaffected.
        if (req.user && !req.user.isAdmin && req.user.role === 'vendor') {
            const hotelIdForRoom = roomData.hotel_id;
            if (!hotelIdForRoom) {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: 'Room is not linked to a hotel' });
            }
            const ownerCheck = await client.query(
                'SELECT vendor_id FROM hotels WHERE id = $1 LIMIT 1',
                [hotelIdForRoom]
            );
            if (Number(ownerCheck.rows[0]?.vendor_id) !== Number(req.user.id)) {
                await client.query('ROLLBACK');
                return res.status(403).json({ error: 'Vendors can only create bookings for hotels they own' });
            }
        }

        const composedGuestName = (
            guestName ||
            [guestFirstName, guestLastName].filter(Boolean).join(' ').trim() ||
            null
        );

        // Create booking with user-provided payment details.
        const bookingResult = await createBookingRecord({
            client,
            roomData,
            roomName: room.name || roomData.room_number || `room-${roomId}`,
            effectiveUserId,
            fromDate,
            toDate,
            totalAmount: totalamount,
            totalDays: toInt(totaldays) || 1,
            hotelId: roomData.hotel_id || room.hotelid || room.hotel_id || null,
            transactionId: finalTransactionId,
            paymentMode: finalPaymentMode,
            specialRequest: normalizedSpecialRequest,
            guestName: composedGuestName,
            guestEmail: email,
            guestPhone: phoneNumber,
            guests,
            adults,
            children,
            bookedRooms: bookedCount,
            currency
        });
        const booking = normalizeBookingRecord(bookingResult.rows[0]);
        const persistedRoomId = booking.roomId || roomData.id;

        // Tag the booking with the guest's country for the admin world map.
        // detectCountry walks: explicit → CDN header → IP geo lookup → locale.
        try {
            const country = await detectCountry(req);
            if (country) {
                await client.query(
                    `ALTER TABLE bookings ADD COLUMN IF NOT EXISTS country text`
                ).catch(() => {});
                await client.query(
                    `UPDATE bookings SET country = $1 WHERE id = $2`,
                    [country, booking.id ?? booking._id ?? bookingResult.rows[0].id],
                ).catch(() => {});
            }
        } catch (_e) {
            // Non-fatal — booking already persisted; just skip the geo tag.
        }

        // Update room's currentbookings
        let currentbookings = roomData.currentbookings || [];
        if (typeof currentbookings === 'string') {
            try { currentbookings = JSON.parse(currentbookings); } catch { currentbookings = []; }
        }
        currentbookings.push({
            bookingid: booking.id,
            fromdate: fromDate,
            todate: toDate,
            userid: effectiveUserId,
            status: booking.status,
            paymentMode: finalPaymentMode,
            transactionId: finalTransactionId,
            specialRequest: normalizedSpecialRequest
        });
        const updateRoomQuery = await getRoomUpdateQuery(client);
        await client.query(updateRoomQuery, [await serializeCurrentBookings(client, currentbookings), persistedRoomId]);
        await adjustRoomCategoryAvailability(client, roomData, -bookedCount);

        await adjustHotelRoomCount(client, roomData.hotel_id, -bookedCount);

        // When the İş Bankası card gateway is live and the guest chose to pay by
        // card, payment is NOT settled here — the booking is left pending and is
        // only confirmed (and emailed) by the POS callback after the card is
        // actually charged. Any other case (pay-at-hotel, or gateway disabled)
        // keeps the original behaviour of recording the booking as paid.
        const deferToPos = pos.isConfigured() && finalPaymentMode === 'card';

        if (deferToPos) {
            // Mark the booking pending until the card payment succeeds.
            await client.query(
                `UPDATE bookings SET status = 'pending' WHERE id = $1`,
                [booking.id ?? bookingResult.rows[0].id]
            ).catch((e) => console.warn('[bookings] pending status set skipped:', e.message));
        } else {
            // Record a payment row so the admin dashboard's revenue rollup
            // (which sums payments.amount) reflects this booking. On schemas
            // without a payments table the catch keeps the booking from rolling
            // back — the table is optional.
            try {
                await client.query(`
                    CREATE TABLE IF NOT EXISTS payments (
                        id            SERIAL PRIMARY KEY,
                        booking_id    integer REFERENCES bookings(id) ON DELETE CASCADE,
                        amount        numeric(12,2) NOT NULL DEFAULT 0,
                        status        text NOT NULL DEFAULT 'paid',
                        created_at    timestamptz NOT NULL DEFAULT NOW(),
                        updated_at    timestamptz NOT NULL DEFAULT NOW()
                    )
                `).catch(() => {});
                await client.query(
                    `INSERT INTO payments (booking_id, amount, currency, method, status, transaction_id)
                     VALUES ($1, $2, $3, $4, 'paid', $5)`,
                    [
                        booking.id ?? bookingResult.rows[0].id,
                        totalamount,
                        currency || 'USD',
                        finalPaymentMode,
                        finalTransactionId
                    ]
                );
            } catch (paymentErr) {
                console.warn('[bookings] payment row skipped:', paymentErr.message);
            }
        }

        await client.query('COMMIT');

        const { hotelName, to: vendorEmailTo, vendorName } = await getHotelContactForEmails(
            client,
            roomData.hotel_id || room.hotelid || room.hotel_id || null
        );
        const roomLabel = room.name || roomData.room_number || `room-${roomId}`;

        // Confirmation + vendor notification emails are sent now ONLY when
        // payment isn't being deferred to the card gateway. For the POS card
        // flow, the İş Bankası callback sends both emails after the charge
        // actually succeeds (so we never email "confirmed" for an unpaid stay).
        if (!deferToPos) {
            // 1) Confirmation to the guest.
            await sendBookingConfirmationEmail({
                email,
                booking,
                roomName: roomLabel,
                hotelName,
                guestName: composedGuestName,
                fromDate,
                toDate,
                totalAmount: totalamount,
                currency: currency || 'USD',
                paymentMode: finalPaymentMode,
                specialRequest: normalizedSpecialRequest
            });

            // 2) Notification to the owning vendor/property AND the admin/ops
            // inbox (best-effort — a mail failure must never break an
            // already-committed booking). Admin is always notified; sent as
            // separate messages so vendor and admin don't see each other.
            const adminInbox = process.env.BOOKING_OPS_INBOX || process.env.SUPPORT_INBOX || process.env.EMAIL_FROM || null;
            const staffRecipients = [...new Set([vendorEmailTo, adminInbox].filter(Boolean))];
            for (const to of staffRecipients) {
                try {
                    await sendVendorBookingNotification({
                        to,
                        vendorName: to === vendorEmailTo ? vendorName : undefined,
                        guestName: composedGuestName,
                        guestEmail: email,
                        guestPhone: phoneNumber,
                        hotelName: hotelName || 'United Hotels Partner Property',
                        roomName: roomLabel,
                        checkIn: fromDate,
                        checkOut: toDate,
                        nights: computeNights(fromDate, toDate),
                        totalAmount: totalamount,
                        currency: currency || 'USD',
                        bookingId: booking.id,
                        paymentMode: finalPaymentMode,
                        specialRequest: normalizedSpecialRequest,
                        manageUrl: `${FRONTEND_URL()}/vendor`,
                    });
                } catch (vendorEmailErr) {
                    console.error('Vendor/admin booking notification failed:', vendorEmailErr?.message || vendorEmailErr);
                }
            }
        }

        res.json({
            message: deferToPos ? 'Booking created — payment required' : 'Room booked successfully',
            // When true, the frontend must start the İş Bankası payment for this
            // booking; the booking stays pending until the card is charged.
            paymentRequired: deferToPos,
            paymentAuthenticated: !isGuestBooking,
            bookingType: isGuestBooking ? 'guest' : 'user',
            roomsReducedBy: bookedCount,
            amount: Number(totalamount),
            currency: currency || 'USD',
            booking: normalizeBookingRecord(booking)
        });
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Booking rollback error:', rollbackError);
        }
        return res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Cancel a booking + restore room inventory, within the caller's transaction.
// Idempotent: the conditional UPDATE means a booking already 'cancelled' is not
// restored twice (avoids over-counting availability). roomId is optional — when
// omitted it's derived from the booking row (used by the stale-payment sweeper).
// Returns the cancelled booking row, or null if it was already cancelled / gone.
const cancelBookingCore = async (client, bookingId, roomId = null) => {
    const bookingColumns = await getBookingColumns(client);
    const bookingUpdatedCol = pickExistingColumn(bookingColumns, ['updated_at', 'updatedAt']);
    const setUpdated = bookingUpdatedCol ? `, "${bookingUpdatedCol}" = NOW()` : '';

    const bookingResult = await client.query(
        `UPDATE bookings SET status = 'cancelled'${setUpdated}
          WHERE id = $1 AND COALESCE(LOWER(status), '') <> 'cancelled'
          RETURNING *`,
        [bookingId]
    );
    if (bookingResult.rowCount === 0) return null; // already cancelled / not found

    const booking = bookingResult.rows[0];
    const effectiveRoomId = roomId || booking.roomid || booking.room_id || null;

    if (effectiveRoomId) {
        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [effectiveRoomId]);
        const roomRow = roomResult.rows[0];
        if (roomRow) {
            let currentbookings = roomRow.currentbookings || [];
            if (typeof currentbookings === 'string') {
                try { currentbookings = JSON.parse(currentbookings); } catch { currentbookings = []; }
            }
            const remaining = currentbookings.filter((b) => String(b.bookingid) !== String(bookingId));
            const updateRoomQuery = await getRoomUpdateQuery(client);
            await client.query(updateRoomQuery, [await serializeCurrentBookings(client, remaining), effectiveRoomId]);
            await adjustRoomCategoryAvailability(client, roomRow, 1);
            if (roomRow.hotel_id) {
                await adjustHotelRoomCount(client, roomRow.hotel_id, 1);
            }
        }
    }
    return booking;
};

// Cancel a booking
const CancelBooking = async (req, res) => {
    const { bookingid, roomid } = req.body;
    const client = await pool.connect();
    let cancelled = null;
    try {
        await client.query('BEGIN');
        cancelled = await cancelBookingCore(client, bookingid, roomid);
        await client.query('COMMIT');
        res.json({ message: "Your booking cancelled Sucessfully" });
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Cancel booking rollback error:', rollbackError);
        }
        return res.status(400).json({ error });
    } finally {
        client.release();
    }

    // Notify guest + vendor + admin that the booking was cancelled. Best-effort,
    // after the response — a mail failure must never affect the cancellation.
    // `cancelled` is null if the booking was already cancelled (no re-notify).
    if (cancelled) {
        notifyBookingCancelled(cancelled).catch((e) =>
            console.error('[bookings] cancellation emails failed:', e?.message || e)
        );
    }
};

// Send cancellation emails to the guest, the owning vendor, and the admin/ops
// inbox. Resolves the hotel name + vendor contact from the cancelled booking row.
const notifyBookingCancelled = async (booking, reason) => {
    const hotelId = booking.hotelid ?? booking.hotel_id ?? null;
    const { hotelName, to: vendorEmailTo } = await getHotelContactForEmails(pool, hotelId);
    const adminInbox = process.env.BOOKING_OPS_INBOX || process.env.SUPPORT_INBOX || process.env.EMAIL_FROM || null;
    const guestEmail = booking.guest_email || booking.guestemail || null;

    const details = {
        guestName: booking.guest_name || booking.guestname || null,
        hotelName: hotelName || 'United Hotels Partner Property',
        roomName: booking.room || `Room #${booking.roomid ?? booking.room_id ?? ''}`,
        checkIn: booking.fromdate ?? booking.check_in_date ?? null,
        checkOut: booking.todate ?? booking.check_out_date ?? null,
        bookingId: booking.id,
        totalAmount: booking.totalamount ?? booking.total_price ?? null,
        currency: booking.currency || 'USD',
        reason: reason || null,
    };

    // 1) Guest.
    if (guestEmail) {
        await sendBookingCancellationEmail({ to: guestEmail, audience: 'guest', ...details })
            .catch((e) => console.error('[bookings] guest cancellation email failed:', e?.message));
    }
    // 2) Vendor + admin (dedup; admin always notified). Sent separately so the
    // two recipients don't see each other's address.
    const staff = [...new Set([vendorEmailTo, adminInbox].filter(Boolean))];
    for (const to of staff) {
        await sendBookingCancellationEmail({ to, audience: 'vendor', ...details })
            .catch((e) => console.error('[bookings] staff cancellation email failed:', e?.message));
    }
};

// Delete booking and restore room inventory.
const DeleteBooking = async (req, res) => {
    const bookingid = req.body?.bookingid || req.params?.bookingid;
    const client = await pool.connect();

    try {
        if (!bookingid) {
            return res.status(400).json({ error: 'bookingid is required' });
        }

        await client.query('BEGIN');

        const bookingResult = await client.query('SELECT * FROM bookings WHERE id = $1 FOR UPDATE', [bookingid]);
        if (bookingResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookingResult.rows[0];
        const roomId = booking.roomid || booking.room_id;
        if (!roomId) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Booking does not contain a room reference' });
        }

        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [roomId]);
        if (roomResult.rowCount === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Room not found for this booking' });
        }

        const roomRow = roomResult.rows[0];
        let currentbookings = roomRow.currentbookings || [];
        if (typeof currentbookings === 'string') {
            try { currentbookings = JSON.parse(currentbookings); } catch { currentbookings = []; }
        }

        const nextBookings = currentbookings.filter((entry) => String(entry.bookingid) !== String(bookingid));
        const updateRoomQuery = await getRoomUpdateQuery(client);
        await client.query(updateRoomQuery, [await serializeCurrentBookings(client, nextBookings), roomId]);

        // Cancel already restored inventory; re-restoring would over-count.
        const alreadyCancelled = String(booking.status || '').toLowerCase() === 'cancelled';
        if (!alreadyCancelled) {
            await adjustRoomCategoryAvailability(client, roomRow, 1);
            if (roomRow?.hotel_id) {
                await adjustHotelRoomCount(client, roomRow.hotel_id, 1);
            }
        }

        await client.query('DELETE FROM bookings WHERE id = $1', [bookingid]);
        await client.query('COMMIT');

        return res.json({
            message: 'Booking deleted successfully',
            roomsRestoredBy: alreadyCancelled ? 0 : 1,
            deletedBookingId: bookingid
        });
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Delete booking rollback error:', rollbackError);
        }
        return res.status(400).json({ error: error.message });
    } finally {
        client.release();
    }
};

// Get all bookings
const getBookings = async (req, res) => {
    try {
        const isAdmin = Boolean(req.user?.isAdmin);
        const userId = req.user?.id;

        const meta = await getBookingMeta(pool);
        const userIdCol = meta.userIdCol ? quoteIdentifier(meta.userIdCol) : '"userid"';
        const orderCol = meta.createdCol ? quoteIdentifier(meta.createdCol) : '"id"';

        const filterByUser = !isAdmin && userId;
        const params = filterByUser ? [userId] : [];
        const bookingsResult = await fetchBookingsEnriched(
            filterByUser ? `b.${userIdCol} = $1` : '',
            params,
            userIdCol,
            orderCol
        );
        res.json({
            bookings: bookingsResult.rows.map(normalizeBookingRecord),
            count: bookingsResult.rowCount,
            scope: isAdmin ? 'admin' : 'user'
        });
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
};

// Get bookings by user id
const getBookingById = async (req, res) => {
    const requestedUserId = req.body.userid;
    try {
        const isAdmin = Boolean(req.user?.isAdmin);
        const effectiveUserId = isAdmin
            ? requestedUserId
            : (req.user?.id || requestedUserId);

        if (!effectiveUserId) {
            return res.status(400).json({ error: 'userid is required' });
        }

        const meta = await getBookingMeta(pool);
        const userIdCol = quoteIdentifier(meta.userIdCol || 'userid');
        const orderCol = meta.createdCol ? quoteIdentifier(meta.createdCol) : '"id"';
        const bookingsResult = await fetchBookingsEnriched(
            `b.${userIdCol} = $1`,
            [effectiveUserId],
            userIdCol,
            orderCol
        );
        res.json({
            bookings: bookingsResult.rows.map(normalizeBookingRecord),
            count: bookingsResult.rowCount,
            userid: effectiveUserId
        });
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }
};

module.exports = { BookRoom, getBookingById, CancelBooking, DeleteBooking, getBookings, cancelBookingCore };