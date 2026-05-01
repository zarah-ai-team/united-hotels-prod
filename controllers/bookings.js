const moment = require("moment");
const pool = require("../db");
const sendMail = require("../utils/mailer");
const { sendBookingConfirmationEmail: sendBookingConfirmationEmailResend } = require('../utils/emails/bookingConfirmationEmail');
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
        `SELECT column_name FROM information_schema.columns WHERE table_name = 'rooms'`
    );
    const cols = new Set(result.rows.map((r) => r.column_name));
    roomColumnsMetaCache = {
        availableRoomsCol: cols.has('available_rooms') ? 'available_rooms' : (cols.has('availableRooms') ? 'availableRooms' : null),
        totalRoomsCol: cols.has('total_rooms') ? 'total_rooms' : (cols.has('totalRooms') ? 'totalRooms' : null),
        availableCol: cols.has('is_available') ? 'is_available' : null,
        updatedCol: cols.has('updated_at') ? 'updated_at' : (cols.has('updatedAt') ? 'updatedAt' : null)
    };

    return roomColumnsMetaCache;
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
    specialRequest: row.special_request ?? row.specialrequest ?? null
});

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
    specialRequest
}) => {
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
        specialRequest
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
            specialRequest: normalizedSpecialRequest
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
        await client.query(updateRoomQuery, [JSON.stringify(currentbookings), persistedRoomId]);
        await adjustRoomCategoryAvailability(client, roomData, -bookedCount);

        await adjustHotelRoomCount(client, roomData.hotel_id, -bookedCount);

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
                `INSERT INTO payments (booking_id, amount, status) VALUES ($1, $2, 'paid')`,
                [booking.id ?? bookingResult.rows[0].id, totalamount]
            );
        } catch (paymentErr) {
            console.warn('[bookings] payment row skipped:', paymentErr.message);
        }

        await client.query('COMMIT');

        const hotelName = await getHotelDisplayName(client, roomData.hotel_id || room.hotelid || room.hotel_id || null);
        await sendBookingConfirmationEmail({
            email,
            booking,
            roomName: room.name || roomData.room_number || `room-${roomId}`,
            hotelName,
            fromDate,
            toDate,
            totalAmount: totalamount,
            paymentMode: finalPaymentMode,
            specialRequest: normalizedSpecialRequest
        });

        res.json({
            message: 'Room booked successfully',
            paymentAuthenticated: !isGuestBooking,
            bookingType: isGuestBooking ? 'guest' : 'user',
            roomsReducedBy: bookedCount,
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

// Cancel a booking
const CancelBooking = async (req, res) => {
    const { bookingid, roomid } = req.body;
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const bookingColumns = await getBookingColumns(client);
        const bookingUpdatedCol = pickExistingColumn(bookingColumns, ['updated_at', 'updatedAt']);
        // Update booking status
        const bookingUpdateAssignments = ['status = $1'];
        if (bookingUpdatedCol) {
            bookingUpdateAssignments.push(`"${bookingUpdatedCol}" = NOW()`);
        }
        const bookingResult = await client.query(`UPDATE bookings SET ${bookingUpdateAssignments.join(', ')} WHERE id = $2 RETURNING *`, ['cancelled', bookingid]);
        const booking = bookingResult.rows[0];
        // Update room's currentbookings
        const roomResult = await client.query('SELECT * FROM rooms WHERE id = $1 FOR UPDATE', [roomid]);
        let currentbookings = roomResult.rows[0].currentbookings || [];
        if (typeof currentbookings === 'string') {
            try { currentbookings = JSON.parse(currentbookings); } catch { currentbookings = []; }
        }
        const temp = currentbookings.filter(booking => booking.bookingid.toString() !== bookingid);
        const updateRoomQuery = await getRoomUpdateQuery(client);
        await client.query(updateRoomQuery, [JSON.stringify(temp), roomid]);
        await adjustRoomCategoryAvailability(client, roomResult.rows[0], 1);
        if (roomResult.rows[0]?.hotel_id) {
            await adjustHotelRoomCount(client, roomResult.rows[0].hotel_id, 1);
        }
        await client.query('COMMIT');
        res.send("Your booking cancelled Sucessfully");
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
        await client.query(updateRoomQuery, [JSON.stringify(nextBookings), roomId]);

        await adjustRoomCategoryAvailability(client, roomRow, 1);
        if (roomRow?.hotel_id) {
            await adjustHotelRoomCount(client, roomRow.hotel_id, 1);
        }

        await client.query('DELETE FROM bookings WHERE id = $1', [bookingid]);
        await client.query('COMMIT');

        return res.json({
            message: 'Booking deleted successfully',
            roomsRestoredBy: 1,
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

        let query = 'SELECT * FROM bookings';
        let params = [];

        if (!isAdmin && userId) {
            query += ' WHERE userid = $1';
            params = [userId];
        }

        query += ' ORDER BY created_at DESC';
        const bookingsResult = await pool.query(query, params);
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

        const bookingsResult = await pool.query(
            'SELECT * FROM bookings WHERE userid = $1 ORDER BY created_at DESC',
            [effectiveUserId]
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

module.exports = { BookRoom, getBookingById, CancelBooking, DeleteBooking, getBookings };