// controllers/isbankPayments.js
//
// HTTP handlers for the İş Bankası Sanal POS (NestPay) 3D Pay Hosting flow.
//   1. POST /api/payments/isbank/initiate  -> sign a 3D form, persist an
//      `initiated` payment row, hand the browser off to the bank's hosted page.
//   2. POST /api/payments/isbank/callback/{ok,fail} -> the bank posts the
//      result here. We verify the HashV3 signature, then settle the payment
//      and confirm the booking. The signature (not the URL) is the source of
//      truth — okUrl can still carry a declined transaction.
//   3. POST /api/payments/isbank/refund/:orderId -> admin-only server-to-server
//      refund / void.
//
// Card data is never seen by this server (hosted page). All secrets come from
// env via utils/isbankPos.

const crypto = require('crypto');
const pool = require('../db');
const pos = require('../utils/isbankPos');
const { resolveHotelVendorContact } = require('../utils/vendorContact');
const { sendBookingConfirmationEmail } = require('../utils/emails/bookingConfirmationEmail');
const { sendVendorBookingNotification } = require('../utils/emails/vendorBookingNotification');
const { convertToTRY } = require('../utils/fx');

const noStore = (res) => res.setHeader('Cache-Control', 'no-store');

let tableReady = false;
const ensurePaymentsTable = async () => {
  if (tableReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      booking_id INTEGER,
      amount NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'TRY',
      method TEXT NOT NULL DEFAULT 'card',
      payment_mode TEXT DEFAULT 'card',
      transaction_id TEXT UNIQUE,
      status TEXT NOT NULL DEFAULT 'created',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  // Bring a leaner legacy table up to the columns this flow needs.
  await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INTEGER`).catch(() => {});
  await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'card'`).catch(() => {});
  await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb`).catch(() => {});
  await pool.query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'TRY'`).catch(() => {});
  tableReady = true;
};

// Order id the bank echoes back on the callback. Alphanumeric + dashes only.
const buildOrderId = (bookingId, userId) => {
  const who = bookingId ? `B${bookingId}` : userId ? `U${userId}` : 'G';
  return `UH-${who}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
};

const frontendResultUrl = (cfg, status, oid, reason) => {
  const base = cfg.frontendUrl || cfg.callbackBaseUrl || '';
  const params = new URLSearchParams({ status, oid: oid || '' });
  if (reason) params.set('reason', reason);
  return `${base}/payment/result?${params.toString()}`;
};

// ── 1. Initiate ───────────────────────────────────────────────────────────────
const initiatePayment = async (req, res) => {
  noStore(res);
  const cfg = pos.config();

  if (!pos.isConfigured(cfg)) {
    return res.status(503).json({
      error: 'Payment gateway is not configured yet',
      detail: 'İş Bankası Sanal POS credentials (ISBANK_POS_CLIENT_ID / ISBANK_POS_STORE_KEY / ISBANK_POS_CALLBACK_BASE_URL) are missing.',
    });
  }

  try {
    const { bookingId, amount, currency, email, billToName, format, notify = {} } = req.body || {};

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      return res.status(400).json({ error: 'amount is required and must be greater than 0' });
    }

    await ensurePaymentsTable();

    const userId = req.user?.id || null;
    const oid = buildOrderId(bookingId, userId);
    const requestedCurrency = String(currency || cfg.currency).toUpperCase();

    // The POS settles in its configured currency (TRY). If the booking is
    // priced in something else, convert at charge time so the bank receives an
    // amount in a currency it's enabled for. A missing FX rate is a hard stop
    // (503) — we never charge a guessed amount.
    let chargeAmount = amountNum;
    let finalCurrency = requestedCurrency;
    let originalAmount = null;
    if (cfg.currency === 'TRY' && requestedCurrency !== 'TRY') {
      try {
        chargeAmount = await convertToTRY(amountNum, requestedCurrency);
        finalCurrency = 'TRY';
        originalAmount = { amount: amountNum, currency: requestedCurrency };
      } catch (e) {
        console.error('[isbank] FX conversion failed:', e.message);
        return res.status(503).json({ error: 'Currency conversion unavailable', detail: e.message });
      }
    }

    // Resolve the vendor/property contact now (we have a DB connection and the
    // hotel id) and stash everything the callback needs to send the guest +
    // vendor confirmation emails after the charge succeeds. The callback has no
    // booking context otherwise, so we carry it in the payment row's metadata.
    let vendor = { to: null, vendorName: null };
    try {
      if (notify.hotelId) vendor = await resolveHotelVendorContact(pool, notify.hotelId);
    } catch (e) {
      console.warn('[isbank] vendor resolve at initiate failed:', e.message);
    }

    const notifyMeta = {
      guestEmail: notify.guestEmail || email || req.user?.email || null,
      guestName: notify.guestName || null,
      guestPhone: notify.guestPhone || null,
      hotelName: notify.hotelName || vendor.hotelName || null,
      roomName: notify.roomName || null,
      checkIn: notify.checkIn || null,
      checkOut: notify.checkOut || null,
      nights: notify.nights || null,
      vendorEmail: vendor.to || null,
      vendorName: vendor.vendorName || null,
    };

    // Persist the attempt up front so the callback has a row to settle, even
    // if the customer abandons the hosted page.
    await pool.query(
      `INSERT INTO payments (user_id, booking_id, amount, currency, method, payment_mode, transaction_id, status, metadata, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'card', 'isbank', $5, 'initiated', $6, NOW(), NOW())`,
      [
        userId,
        bookingId || null,
        chargeAmount,
        finalCurrency,
        oid,
        JSON.stringify({ gateway: 'isbank', billToName: billToName || null, originalAmount, notify: notifyMeta }),
      ]
    );

    const okUrl = `${cfg.callbackBaseUrl}/api/payments/isbank/callback/ok`;
    const failUrl = `${cfg.callbackBaseUrl}/api/payments/isbank/callback/fail`;

    const fields = pos.buildPaymentFormFields({
      oid,
      amount: chargeAmount,
      currency: finalCurrency,
      okUrl,
      failUrl,
      email: email || req.user?.email,
      billToName,
      cfg,
    });

    // Server-driven flow: return a self-submitting page that lands the browser
    // on the bank's hosted card form.
    if (format === 'html' || /text\/html/.test(req.headers.accept || '')) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.send(pos.renderAutoSubmitForm(cfg.gateUrl, fields));
    }

    // SPA-driven flow: the frontend builds + auto-submits the form from these.
    return res.json({
      oid,
      gateUrl: cfg.gateUrl,
      fields,
      formHtml: pos.renderAutoSubmitForm(cfg.gateUrl, fields),
      // What the card will actually be charged (post-FX), for the UI.
      chargeAmount,
      chargeCurrency: finalCurrency,
      originalAmount,
    });
  } catch (error) {
    console.error('[isbank] initiate failed:', error);
    return res.status(500).json({ error: 'Could not start payment' });
  }
};

// ── 2. Callback ────────────────────────────────────────────────────────────────
const handleCallback = async (req, res) => {
  noStore(res);
  const cfg = pos.config();
  const body = req.body || {};
  const oid = body.oid || body.ReturnOid || body.orderId || '';

  // 1) Authenticate the bank's response. A bad/absent signature means we do not
  // trust ANY field — never settle, redirect to a generic failure.
  if (!pos.verifyCallbackHash(body, cfg.storeKey)) {
    console.warn('[isbank] callback hash verification FAILED for oid=%s', oid);
    return res.redirect(303, frontendResultUrl(cfg, 'failed', oid, 'signature'));
  }

  try {
    await ensurePaymentsTable();
    const existing = await pool.query(
      'SELECT id, amount, currency, status, booking_id, metadata FROM payments WHERE transaction_id = $1 LIMIT 1',
      [oid]
    );
    const payment = existing.rows[0];

    if (!payment) {
      console.warn('[isbank] callback for unknown oid=%s', oid);
      return res.redirect(303, frontendResultUrl(cfg, 'failed', oid, 'unknown_order'));
    }

    // Idempotency: the bank may post twice. Don't re-settle a finished payment.
    if (payment.status === 'paid') {
      return res.redirect(303, frontendResultUrl(cfg, 'success', oid));
    }

    const approved = pos.isCallbackApproved(body);

    // Defence in depth: signature already covers tampering, but cross-check the
    // amount the bank reports against what we recorded at initiation.
    const reportedAmount = Number(body.amount);
    const amountMatches =
      !body.amount || Math.abs(reportedAmount - Number(payment.amount)) < 0.01;

    const settledStatus = approved && amountMatches ? 'paid' : 'failed';

    const meta = {
      gateway: 'isbank',
      mdStatus: body.mdStatus,
      Response: body.Response,
      ProcReturnCode: body.ProcReturnCode,
      AuthCode: body.AuthCode,
      HostRefNum: body.HostRefNum,
      TransId: body.TransId,
      ErrMsg: body.ErrMsg || body.mdErrorMsg || null,
      amountMatched: amountMatches,
    };

    await pool.query(
      `UPDATE payments
         SET status = $1,
             metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
             updated_at = NOW()
       WHERE transaction_id = $3`,
      [settledStatus, JSON.stringify(meta), oid]
    );

    // Confirm the booking + send confirmation emails on success (best-effort,
    // schema-tolerant). This block runs only on the transition to 'paid' (the
    // early return above makes repeat callbacks idempotent), so emails fire once.
    if (settledStatus === 'paid') {
      if (payment.booking_id) {
        await pool
          .query(`UPDATE bookings SET status = 'confirmed' WHERE id = $1`, [payment.booking_id])
          .catch((e) => console.warn('[isbank] booking status update skipped:', e.message));
      }

      const n = (payment.metadata && payment.metadata.notify) || {};
      // Guest confirmation.
      if (n.guestEmail) {
        try {
          await sendBookingConfirmationEmail({
            to: n.guestEmail,
            guestName: n.guestName,
            bookingId: payment.booking_id || oid,
            hotelName: n.hotelName || 'United Hotels Partner Property',
            roomName: n.roomName,
            checkIn: n.checkIn,
            checkOut: n.checkOut,
            nights: n.nights,
            totalAmount: payment.amount,
            currency: payment.currency,
            manageUrl: `${cfg.callbackBaseUrl}/portal`,
          });
        } catch (e) {
          console.error('[isbank] guest confirmation email failed:', e.message);
        }
      }
      // Vendor / property notification AND admin notification. The admin is
      // always notified on a successful booking; sent as separate messages so
      // vendor and admin don't see each other's address. Admin → admin@admin.com
      // by default (override with ADMIN_NOTIFY_EMAIL). Same 3-email flow as the
      // non-card path: guest confirmation, vendor/hotel notice, admin notice.
      const adminInbox = process.env.ADMIN_NOTIFY_EMAIL || 'admin@admin.com';
      const staffRecipients = [...new Set([n.vendorEmail, adminInbox].filter(Boolean))];
      for (const to of staffRecipients) {
        try {
          await sendVendorBookingNotification({
            to,
            vendorName: to === n.vendorEmail ? n.vendorName : undefined,
            guestName: n.guestName,
            guestEmail: n.guestEmail,
            guestPhone: n.guestPhone,
            hotelName: n.hotelName || 'United Hotels Partner Property',
            roomName: n.roomName,
            checkIn: n.checkIn,
            checkOut: n.checkOut,
            nights: n.nights,
            totalAmount: payment.amount,
            currency: payment.currency,
            bookingId: payment.booking_id || oid,
            paymentMode: 'card',
            manageUrl: `${cfg.callbackBaseUrl}/vendor`,
          });
        } catch (e) {
          console.error('[isbank] vendor/admin notification email failed:', e.message);
        }
      }
    }

    if (settledStatus !== 'paid') {
      console.warn(
        '[isbank] payment NOT approved oid=%s mdStatus=%s Response=%s ProcReturnCode=%s',
        oid, body.mdStatus, body.Response, body.ProcReturnCode
      );
    }

    return res.redirect(
      303,
      frontendResultUrl(cfg, settledStatus === 'paid' ? 'success' : 'failed', oid,
        settledStatus === 'paid' ? undefined : (amountMatches ? 'declined' : 'amount_mismatch'))
    );
  } catch (error) {
    console.error('[isbank] callback processing failed for oid=%s:', oid, error);
    return res.redirect(303, frontendResultUrl(cfg, 'failed', oid, 'error'));
  }
};

// ── 3. Refund / void (admin) ────────────────────────────────────────────────────
const refundPayment = async (req, res) => {
  noStore(res);
  const cfg = pos.config();
  const orderId = req.params.orderId || req.body?.orderId;
  const { amount, currency, mode } = req.body || {};

  if (!orderId) {
    return res.status(400).json({ error: 'orderId is required' });
  }

  try {
    await ensurePaymentsTable();
    const existing = await pool.query(
      'SELECT id, status, currency FROM payments WHERE transaction_id = $1 LIMIT 1',
      [orderId]
    );
    const payment = existing.rows[0];
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found for that orderId' });
    }

    const result =
      mode === 'void'
        ? await pos.voidTransaction(orderId, cfg)
        : await pos.refund(orderId, { amount, currency: currency || payment.currency }, cfg);

    if (!result.approved) {
      return res.status(402).json({
        error: 'Bank declined the refund/void',
        procReturnCode: result.procReturnCode,
        bankMessage: result.errMsg,
      });
    }

    const newStatus = mode === 'void' ? 'voided' : amount ? 'partially_refunded' : 'refunded';
    await pool.query(
      `UPDATE payments
         SET status = $1,
             metadata = COALESCE(metadata, '{}'::jsonb) || $2::jsonb,
             updated_at = NOW()
       WHERE transaction_id = $3`,
      [
        newStatus,
        JSON.stringify({ refund: { mode: mode || 'credit', amount: amount || null, transId: result.transId, at: new Date().toISOString() } }),
        orderId,
      ]
    );

    return res.json({ message: 'Refund/void successful', status: newStatus, transId: result.transId });
  } catch (error) {
    console.error('[isbank] refund failed for orderId=%s:', orderId, error);
    return res.status(500).json({ error: 'Refund/void request failed' });
  }
};

module.exports = { initiatePayment, handleCallback, refundPayment };
